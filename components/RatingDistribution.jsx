'use client'

export default function RatingDistribution({ reviews }) {
    if (!reviews || reviews.length === 0) return null;

    // Initialize 10 bins: [0-1), [1-2), ..., [9-10]
    const bins = Array(10).fill(0);

    reviews.forEach(r => {
        const rating = parseFloat(r.rating);
        let index = Math.floor(rating);
        if (index === 10) index = 9; // Handle perfect 10 in the last bin
        if (index >= 0 && index < 10) {
            bins[index]++;
        }
    });

    const maxCount = Math.max(...bins);

    // RYM-inspired colors: Red (0-1) to Green (9-10)
    // Values roughly mapping from #ff0000 to #00ff00 or similar gradient
    const colors = [
        '#d00', // 0
        '#e44', // 1
        '#f84', // 2
        '#fb4', // 3
        '#fd4', // 4
        '#df4', // 5
        '#bf4', // 6
        '#9f4', // 7
        '#4f4', // 8
        '#0d0'  // 9
    ];

    return (
        <div style={{
            background: '#111',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #222',
            marginBottom: '3rem'
        }}>
            <h3 style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rating Distribution
            </h3>

            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '120px',
                gap: '4px'
            }}>
                {bins.map((count, i) => {
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                        <div key={i} style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%'
                        }}>
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'flex-end',
                                width: '100%',
                                marginBottom: '8px'
                            }}>
                                <div
                                    title={`${i}-${i + 1}: ${count} reviews`}
                                    style={{
                                        width: '100%',
                                        height: `${height}%`,
                                        background: colors[i],
                                        opacity: count > 0 ? 1 : 0.1,
                                        borderRadius: '2px 2px 0 0',
                                        transition: 'height 0.3s ease'
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#555', fontWeight: 700 }}>{i}</div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '0.75rem', color: '#666' }}>
                Total {reviews.length} ratings
            </div>
        </div>
    );
}
