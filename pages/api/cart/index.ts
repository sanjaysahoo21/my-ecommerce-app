import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { addToCartSchema, removeFromCartSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user) {
        return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    const userId = session.user.id;
    let user;

    if (userId) {
        user = await prisma.user.findUnique({
            where: { id: userId },
        });
    } else if (session.user.email) {
        user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });
    }

    if (!user) {
        return res.status(401).json({ error: 'User not found.' });
    }

    try {
        switch (req.method) {
            case 'GET':
                return await handleGetCart(user.id, res);
            case 'POST':
                return await handleAddToCart(user.id, req, res);
            case 'DELETE':
                return await handleRemoveFromCart(user.id, req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                return res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        console.error('Cart API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// GET /api/cart - Fetch user's cart
async function handleGetCart(userId: string, res: NextApiResponse) {
    // Get or create cart
    let cart = await prisma.cart.findUnique({
        where: { userId },
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

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
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
                },
            },
        });
    }

    const total = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    return res.status(200).json({
        cart: {
            id: cart.id,
            items: cart.items,
            total: Math.round(total * 100) / 100,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
    });
}

// POST /api/cart - Add item to cart
async function handleAddToCart(
    userId: string,
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Validate request body
    let validated;
    try {
        validated = addToCartSchema.parse(req.body);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.issues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        return res.status(400).json({ error: 'Invalid request body' });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
        where: { id: validated.productId },
    });

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.inStock) {
        return res.status(400).json({ error: 'Product is out of stock' });
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
        where: { userId },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
        });
    }

    // Upsert cart item (add or increase quantity)
    const existingItem = await prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId: cart.id,
                productId: validated.productId,
            },
        },
    });

    if (existingItem) {
        const newQuantity = existingItem.quantity + validated.quantity;
        if (newQuantity > 99) {
            return res.status(400).json({ error: 'Total quantity cannot exceed 99 per item' });
        }
        await prisma.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: newQuantity },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: validated.productId,
                quantity: validated.quantity,
            },
        });
    }

    // Return updated cart
    return handleGetCart(userId, res);
}

// DELETE /api/cart - Remove item from cart
async function handleRemoveFromCart(
    userId: string,
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Validate request body
    let validated;
    try {
        validated = removeFromCartSchema.parse(req.body);
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.issues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        return res.status(400).json({ error: 'Invalid request body' });
    }

    const cart = await prisma.cart.findUnique({
        where: { userId },
    });

    if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
    }

    // Find and delete the cart item
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

    await prisma.cartItem.delete({
        where: { id: cartItem.id },
    });

    // Return updated cart
    return handleGetCart(userId, res);
}
