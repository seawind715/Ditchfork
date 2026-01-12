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
            <div style={{ fontSize: '0.9rem', color: '#444' }}>
                &copy; 2026 Ditchfork. All rights reserved.
            </div>
        </main>
    )
}
