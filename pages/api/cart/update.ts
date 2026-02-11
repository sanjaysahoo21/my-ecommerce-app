import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { updateCartItemSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
        return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!user) {
        return res.status(401).json({ error: 'User not found.' });
    }

    // Validate request body
    let validated;
    try {
        validated = updateCartItemSchema.parse(req.body);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        return res.status(400).json({ error: 'Invalid request body' });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: user.id },
        });

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: validated.productId,
                },
            },
        });

        if (!cartItem) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        // Update quantity
        await prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: validated.quantity },
        });

        // Fetch updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { userId: user.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                imageUrl: true,
                                inStock: true,
                            },
                        },
                    },
                    orderBy: { id: 'asc' },
                },
            },
        });

        const total = updatedCart!.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );

        return res.status(200).json({
            cart: {
                id: updatedCart!.id,
                items: updatedCart!.items,
                total: Math.round(total * 100) / 100,
                itemCount: updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0),
            },
        });
    } catch (error) {
        console.error('Cart update error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
