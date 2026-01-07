'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function ReviewCard({ review }) {
    // Parsing the genre to get the first one if multiple (though we use simple text for now)
    const genre = review.genre || 'Unknown'

    return (
                    </div >
                    <h3 className="card-title" style={{
                        fontSize: '1.1rem',
                        marginBottom: '0.4rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {review.album_name}
                        {review.release_year && (
                            <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 400, marginLeft: '0.5rem' }}>
                                ({review.release_year})
                            </span>
                        )}
                    </h3>
                    <div className="card-author" style={{
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem',
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: '0.3rem',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                    }}>
                        {review.artist_name?.split(',').map((name, i, arr) => (
                            <span key={name.trim()}>
                                {name.trim()}
                                {i < arr.length - 1 && <span style={{ marginLeft: '0.1rem', opacity: 0.5 }}>,</span>}
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 800 }}>{review.rating?.toFixed(1) || '0.0'}</span>
                            {review.review_count > 1 && (
                                <span style={{
                                    fontSize: '0.7rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '10px',
                                    fontWeight: 700
                                }}>
                                    {review.review_count} Reviews
                                </span>
                            )}
                        </div>
                    </div>
                </div >
            </Link >


        </div >
    )
}
