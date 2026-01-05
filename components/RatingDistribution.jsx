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
            background: '#0a0a0a',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #1a1a1a',
            marginBottom: '3rem'
        }}>
            <h3 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                Rating Distribution
            </h3>

            <div style={{
                display: 'flex',
                flexDirection: 'column-reverse', // 0 at bottom, 10 at top
                gap: '6px'
            }}>
                {bins.map((count, i) => {
                    const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#444', fontWeight: 800, width: '15px', textAlign: 'right' }}>
                                {i}
                            </div>
                            <div style={{
                                flex: 1,
                                height: '4px', // Slimmer bar
                                background: '#1a1a1a',
                                borderRadius: '2px',
                                overflow: 'hidden'
                            }}>
                                <div
                                    style={{
                                        width: `${width}%`,
                                        height: '100%',
                                        background: colors[i],
                                        opacity: count > 0 ? 1 : 0.05,
                                        borderRadius: '2px',
                                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: count > 0 ? '#888' : '#333', width: '30px', fontWeight: 600 }}>
                                {count > 0 ? count : ''}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #1a1a1a', paddingTop: '1rem', textAlign: 'right', fontSize: '0.7rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total {reviews.length} ratings
            </div>
        </div>
    );
}
