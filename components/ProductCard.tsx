import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    inStock: boolean;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <>
            <Link href={`/products/${product.id}`}>
                <div className="product-card" data-testid={`product-card-${product.id}`}>
                    <div className="product-card-image-wrapper">
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="product-card-image"
                            loading="lazy"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://placehold.co/600x400?text=Product+Image';
                            }}
                        />
                        <span className="product-card-category">{product.category}</span>
                        {!product.inStock && (
                            <span className="product-card-out-of-stock">Out of Stock</span>
                        )}
                    </div>
                    <div className="product-card-body">
                        <h3 className="product-card-name">{product.name}</h3>
                        <p className="product-card-description">{product.description}</p>
                        <div className="product-card-footer">
                            <span className="product-card-price">${product.price.toFixed(2)}</span>
                            <button
                                className="product-card-add-btn"
                                onClick={handleAddToCart}
                                disabled={!product.inStock || isAdding}
                                data-testid={`add-to-cart-button-${product.id}`}
                            >
                                {isAdding ? (
                                    <span className="signin-spinner" style={{ width: 14, height: 14 }} />
                                ) : (
                                    <>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                        Add
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Link>

            {showToast && (
                <div className="toast toast-success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Added to cart!
                </div>
            )}
        </>
    );
}
