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

    try {
        const { q, page = '1', category, limit = '12' } = req.query;
        const searchQuery = Array.isArray(q) ? q[0] : q || '';
        const selectedCategory = Array.isArray(category) ? category[0] : category || '';
        const currentPage = Math.max(1, parseInt(Array.isArray(page) ? page[0] : page, 10) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(Array.isArray(limit) ? limit[0] : limit, 10) || 12));

        // Build where clause
        const where: any = {};

        if (searchQuery) {
            where.OR = [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
            ];
        }

        if (selectedCategory && selectedCategory !== 'All') {
            where.category = selectedCategory;
        }

        // Get total count
        const totalProducts = await prisma.product.count({ where });
        const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

        // Fetch products
        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
        });

        return res.status(200).json({
            products,
            pagination: {
                currentPage,
                totalPages,
                totalProducts,
                pageSize,
            },
        });
    } catch (error) {
        console.error('Products API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
