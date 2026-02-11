import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import prisma from '@/lib/prisma';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    inStock: boolean;
    createdAt: string;
}

interface ProductDetailProps {
    product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleAddToCart = async () => {
        if (!session) {
            router.push('/auth/signin');
            return;
        }

        setIsAdding(true);
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity: 1 }),
            });

            if (res.ok) {
                setToastMessage('Added to cart successfully!');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } else {
                const data = await res.json();
                setToastMessage(data.error || 'Failed to add to cart');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            setToastMessage('Network error. Please try again.');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <>
            <Head>
                <title>{product.name} - ShopNova</title>
                <meta name="description" content={product.description.substring(0, 160)} />
            </Head>

            {/* Breadcrumb */}
            <nav style={{ marginBottom: '1.5rem' }}>
                <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    ← Back to Products
                </Link>
            </nav>

            <div className="product-detail">
                {/* Product Image */}
                <div className="product-detail-image-wrapper">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="product-detail-image"
                    />
                </div>

                {/* Product Info */}
                <div className="product-detail-info">
                    <span className="product-detail-category">{product.category}</span>

                    <h1 className="product-detail-name" data-testid="product-name">
                        {product.name}
                    </h1>

                    <div className="product-detail-price" data-testid="product-price">
                        ${product.price.toFixed(2)}
                    </div>

                    <p className="product-detail-description" data-testid="product-description">
                        {product.description}
                    </p>

                    {/* Actions */}
                    <div className="product-detail-actions">
                        <button
                            className="btn-add-to-cart"
                            onClick={handleAddToCart}
                            disabled={!product.inStock || isAdding}
                            data-testid="add-to-cart-button"
                        >
                            {isAdding ? (
                                <span className="signin-spinner" style={{ width: 20, height: 20 }} />
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1" />
                                        <circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </>
                            )}
                        </button>

                        <Link href="/cart" className="btn-secondary">
                            View Cart
                        </Link>
                    </div>

                    {/* Meta Info */}
                    <div className="product-detail-meta">
                        <div className="product-detail-meta-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {product.inStock ? 'In Stock — Ready to Ship' : 'Currently Out of Stock'}
                        </div>
                        <div className="product-detail-meta-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="3" width="15" height="13" />
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                            Free shipping on orders over $50
                        </div>
                        <div className="product-detail-meta-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 4 23 10 17 10" />
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            30-day return policy
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className={`toast ${toastMessage.includes('success') ? 'toast-success' : 'toast-error'}`}>
                    {toastMessage.includes('success') ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    )}
                    {toastMessage}
                </div>
            )}
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params as { id: string };

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                imageUrl: true,
                category: true,
                inStock: true,
                createdAt: true,
            },
        });

        if (!product) {
            return { notFound: true };
        }

        return {
            props: {
                product: JSON.parse(JSON.stringify(product)),
            },
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        return { notFound: true };
    }
};
