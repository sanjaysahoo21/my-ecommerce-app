import { GetServerSidePropsContext } from 'next';
import { getProviders, signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import Head from 'next/head';

interface SignInProps {
    providers: Awaited<ReturnType<typeof getProviders>>;
}

export default function SignIn({ providers }: SignInProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCredentialSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await signIn('credentials', { email, callbackUrl: '/' });
        setIsLoading(false);
    };

    return (
        <>
            <Head>
                <title>Sign In - ShopNova</title>
                <meta name="description" content="Sign in to your ShopNova account" />
            </Head>
            <div className="signin-container">
                <div className="signin-card">
                    <div className="signin-header">
                        <div className="signin-logo">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <rect width="48" height="48" rx="12" fill="url(#grad)" />
                                <path d="M14 24l6 6 14-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                <defs>
                                    <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48">
                                        <stop stopColor="#6366f1" />
                                        <stop offset="1" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h1>Welcome to ShopNova</h1>
                        <p>Sign in to access your cart and start shopping</p>
                    </div>

                    {/* OAuth Providers */}
                    {providers && Object.values(providers).map((provider) => {
                        if (provider.id === 'credentials') return null;
                        return (
                            <button
                                key={provider.name}
                                data-testid="signin-button"
                                className="signin-oauth-btn"
                                onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                            >
                                {provider.id === 'github' && (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                )}
                                Continue with {provider.name}
                            </button>
                        );
                    })}

                    <div className="signin-divider">
                        <span>or sign in with test account</span>
                    </div>

                    {/* Credentials Form */}
                    <form onSubmit={handleCredentialSignIn} className="signin-form">
                        <div className="signin-input-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="test.user@example.com"
                                required
                                className="signin-input"
                            />
                        </div>
                        <button
                            type="submit"
                            data-testid="signin-button"
                            className="signin-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="signin-spinner" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="signin-hint">
                        Use <strong>test.user@example.com</strong> for the test account
                    </p>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getSession(context);
    if (session) {
        return { redirect: { destination: '/', permanent: false } };
    }

    const providers = await getProviders();
    return {
        props: { providers: providers ?? {} },
    };
}
