import Head from 'next/head';
import Link from 'next/link';

interface ErrorProps {
    statusCode?: number;
}

export default function Error({ statusCode }: ErrorProps) {
    return (
        <>
            <Head>
                <title>{statusCode || 'Error'} - ShopNova</title>
            </Head>
            <div className="error-page">
                <div className="error-page-code">{statusCode || '?'}</div>
                <h2>Something Went Wrong</h2>
                <p>
                    {statusCode
                        ? `A ${statusCode} error occurred on the server.`
                        : 'An unexpected error occurred on the client.'}
                    {' '}Please try again or go back to the home page.
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

Error.getInitialProps = ({ res, err }: any) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};
