'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function ReviewCard({ review }) {
    // Parsing the genre to get the first one if multiple (though we use simple text for now)
    const genre = review.genre || 'Unknown'

    return (
        <Link href={`/reviews/${review.id}`} className="review-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ position: 'relative', aspectRatio: '1/1', width: '100%', overflow: 'hidden' }}>
                    {review.is_cover_hidden ? (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#111',
                            color: '#666',
                            padding: '1rem',
                            textAlign: 'center'
                        }}>
                            <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🙈</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cover Hidden</span>
                        </div>
                    ) : review.cover_image_url ? (
                        <Image
                            src={review.cover_image_url}
                            alt={`${review.album_name} cover`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'cover' }}
                            className="transition-opacity duration-300"
                        />
                    ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', background: '#333' }}>
                            No Cover
                        </div>
                    )}
                    <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        color: '#fff',
                        backdropFilter: 'blur(4px)'
                    }}>
                        {genre}
                    </div>
                </div>

                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="card-title" style={{
                        fontSize: '1.1rem',
                        marginBottom: '0.4rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        margin: 0
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
                        color: '#aaa',
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
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{review.rating?.toFixed(1) || '0.0'}</span>
                            {review.review_count > 1 && (
                                <span style={{
                                    fontSize: '0.7rem',
                                    background: '#333',
                                    color: '#ccc',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '10px',
                                    fontWeight: 700
                                }}>
                                    {review.review_count} Reviews
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
