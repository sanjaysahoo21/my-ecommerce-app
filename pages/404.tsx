import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
    return (
        <>
            <Head>
                <title>404 - Page Not Found | ShopNova</title>
                <meta name="description" content="The page you're looking for doesn't exist." />
            </Head>
            <div className="error-page">
                <div className="error-page-code">404</div>
                <h2>Page Not Found</h2>
                <p>
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>
                <Link href="/" className="cart-empty-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Back to Home
                </Link>
            </div>
        </>
    );
}
