import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface CartProduct {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    inStock: boolean;
}

interface CartItem {
    id: string;
    quantity: number;
    productId: string;
    product: CartProduct;
}

interface CartData {
    id: string;
    items: CartItem[];
    total: number;
    itemCount: number;
}

export default function CartPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cart, setCart] = useState<CartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

    const fetchCart = useCallback(async () => {
        try {
            const res = await fetch('/api/cart');
            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchCart();
        } else if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
    }, [status, fetchCart, router]);

    const updateQuantity = async (productId: string, quantity: number) => {
        setUpdatingItems((prev) => new Set(prev).add(productId));
        try {
            const res = await fetch('/api/cart/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity }),
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setUpdatingItems((prev) => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    const removeItem = async (productId: string) => {
        setUpdatingItems((prev) => new Set(prev).add(productId));
        try {
            const res = await fetch('/api/cart', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId }),
            });
            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        } finally {
            setUpdatingItems((prev) => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    if (loading || status === 'loading') {
        return (
            <>
                <Head>
                    <title>Shopping Cart - ShopHere</title>
                </Head>
                <div className="loading-container">
                    <div className="loading-spinner" />
                </div>
            </>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <>
                <Head>
                    <title>Shopping Cart - ShopNova</title>
                </Head>
                <div className="cart-empty">
                    <div className="cart-empty-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything to your cart yet</p>
                    <Link href="/" className="cart-empty-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Continue Shopping
                    </Link>
                </div>
            </>
        );
    }

    const subtotal = cart.total;
    const shipping = subtotal > 50 ? 0 : 9.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const grandTotal = Math.round((subtotal + shipping + tax) * 100) / 100;

    return (
        <>
            <Head>
                <title>Shopping Cart ({cart.itemCount}) - ShopHere</title>
                <meta name="description" content="Review and manage your shopping cart items" />
            </Head>

            <section className="page-hero" style={{ paddingBottom: '0.5rem' }}>
                <h1>Shopping Cart</h1>
                <p>{cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} in your cart</p>
            </section>

            <div className="cart-layout">
                {/* Cart Items */}
                <div className="cart-items">
                    {cart.items.map((item) => (
                        <div
                            key={item.id}
                            className="cart-item"
                            data-testid={`cart-item-${item.product.id}`}
                            style={{ opacity: updatingItems.has(item.product.id) ? 0.6 : 1 }}
                        >
                            <Link href={`/products/${item.product.id}`}>
                                <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="cart-item-image"
                                />
                            </Link>

                            <div className="cart-item-details">
                                <div>
                                    <Link href={`/products/${item.product.id}`}>
                                        <h3 className="cart-item-name">{item.product.name}</h3>
                                    </Link>
                                    <p className="cart-item-price">${item.product.price.toFixed(2)} each</p>
                                </div>

                                <div className="cart-item-controls">
                                    <div className="cart-item-quantity">
                                        <button
                                            className="cart-quantity-btn"
                                            onClick={() => {
                                                if (item.quantity > 1) {
                                                    updateQuantity(item.product.id, item.quantity - 1);
                                                }
                                            }}
                                            disabled={item.quantity <= 1 || updatingItems.has(item.product.id)}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            className="cart-quantity-input"
                                            value={item.quantity}
                                            min={1}
                                            max={99}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value, 10);
                                                if (val >= 1 && val <= 99) {
                                                    updateQuantity(item.product.id, val);
                                                }
                                            }}
                                            data-testid={`quantity-input-${item.product.id}`}
                                            disabled={updatingItems.has(item.product.id)}
                                        />
                                        <button
                                            className="cart-quantity-btn"
                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                            disabled={item.quantity >= 99 || updatingItems.has(item.product.id)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <span className="cart-item-subtotal">
                                        ${(item.product.price * item.quantity).toFixed(2)}
                                    </span>

                                    <button
                                        className="cart-item-remove"
                                        onClick={() => removeItem(item.product.id)}
                                        disabled={updatingItems.has(item.product.id)}
                                        data-testid={`remove-item-button-${item.product.id}`}
                                        title="Remove item"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <line x1="10" y1="11" x2="10" y2="17" />
                                            <line x1="14" y1="11" x2="14" y2="17" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary">
                    <h2>Order Summary</h2>

                    <div className="cart-summary-row">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="cart-summary-row">
                        <span>Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="cart-summary-row total">
                        <span>Total</span>
                        <span className="cart-summary-total-value" data-testid="cart-total">
                            ${grandTotal.toFixed(2)}
                        </span>
                    </div>

                    {shipping > 0 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                            Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                        </p>
                    )}

                    <button className="cart-checkout-btn">
                        Proceed to Checkout
                    </button>

                    <Link
                        href="/"
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            marginTop: '1rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-accent)',
                        }}
                    >
                        ← Continue Shopping
                    </Link>
                </div>
            </div>
        </>
    );
}
