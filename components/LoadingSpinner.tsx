interface LoadingSpinnerProps {
    size?: number;
    text?: string;
}

export default function LoadingSpinner({ size = 48, text }: LoadingSpinnerProps) {
    return (
        <div className="loading-container">
            <div style={{ textAlign: 'center' }}>
                <div
                    className="loading-spinner"
                    style={{ width: size, height: size, margin: '0 auto' }}
                />
                {text && (
                    <p style={{
                        marginTop: '1rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                    }}>
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}
