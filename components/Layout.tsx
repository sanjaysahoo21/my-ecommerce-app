import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, FormEvent } from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    // Don't show layout on sign-in page
    if (router.pathname === '/auth/signin') {
        return <>{children}</>;
    }

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push('/');
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    <Link href="/" className="navbar-logo">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#navGrad)" />
                            <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="navGrad" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        ShopNova
                    </Link>

                    <div className="navbar-actions">
                        <form onSubmit={handleSearch} className="navbar-search">
                            <input
                                type="text"
                                className="navbar-search-input"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                data-testid="search-input"
                            />
                            <span className="navbar-search-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="M21 21l-4.35-4.35" />
                                </svg>
                            </span>
                            <button type="submit" className="navbar-search-btn" data-testid="search-button">
                                Search
                            </button>
                        </form>

                        <Link href="/cart" className="nav-btn nav-btn-ghost">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            <span>Cart</span>
                        </Link>

                        {session ? (
                            <>
                                {session.user?.image && (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="nav-user-avatar"
                                    />
                                )}
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="nav-btn nav-btn-danger"
                                    data-testid="signout-button"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    <span>Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <Link href="/auth/signin" className="nav-btn nav-btn-primary" data-testid="signin-button">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" y1="12" x2="3" y2="12" />
                                </svg>
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-content">
                {children}
            </main>

            <footer className="footer">
                <p>© 2026 ShopNova. Built with Next.js, Prisma & NextAuth.js</p>
            </footer>
        </>
    );
}
