export default function VerifyEmail({url}: {url: string}) {
    return <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f5', padding: '40px 0' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <img src="https://mesa-ai.vercel.app/BannerLight.png" alt="Mesa AI Logo" style={{ width: '150px', marginBottom: '20px' }} />
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#18181b', marginBottom: '24px' }}>Welcome to Mesa AI</h1>
                <p style={{ fontSize: '16px', color: '#3f3f46', marginBottom: '24px' }}>Click the button below to confirm your email address and setup your Mesa AI account.</p>
                <a 
                    href={url}
                    style={{
                        display: 'inline-block',
                        backgroundColor: '#18181b',
                        color: '#ffffff',
                        padding: '12px 32px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '16px',
                        fontWeight: 500
                    }}
                >
                    Verify Email
                </a>
                <p style={{ marginTop: '16px', fontSize: '14px', color: '#71717a' }}>You'll be signed in automatically.</p>
            </div>
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#a1a1aa' }}>If this was a mistake, you can safely ignore this email.</p>
        </div>
    </div>
}