
export default function MoviesPage() {
    return (
        <main className="container section" style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Movie</h1>
            <p style={{ fontSize: '1.5rem', color: '#888' }}>
                Coming Soon...
            </p>
            <p style={{ marginTop: '2rem', color: '#666' }}>
                We are working hard to bring you the movie reviews!
            </p>
        </main>
    )
}
