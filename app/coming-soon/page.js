export default function ComingSoon() {
    return (
        <main style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            color: '#fff',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1rem', color: '#ff3333' }}>DITCHFORK</h1>
            <p style={{ fontSize: '1.5rem', color: '#888', marginBottom: '3rem' }}>
                We are currently upgrading our system.<br />
                Please check back soon.
            </p>
            <a href="/" style={{
                padding: '0.8rem 1.5rem',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                textDecoration: 'none',
                marginBottom: '3rem',
                fontSize: '0.9rem',
                transition: 'background 0.2s',
            }} onMouseOver={e => e.currentTarget.style.background = '#222'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                Go to Home (If available)
            </a>
            <div style={{ fontSize: '0.9rem', color: '#444' }}>
                &copy; 2026 Ditchfork. All rights reserved.
            </div>
        </main>
    )
}
