import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { id } = req.query;
    const productId = Array.isArray(id) ? id[0] : id;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json({ product });
    } catch (error) {
        console.error('Product API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
