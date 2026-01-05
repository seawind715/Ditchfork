'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function ReviewCard({ review }) {
    // Parsing the genre to get the first one if multiple (though we use simple text for now)
    const genre = review.genre || 'Unknown'

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Link href={`/reviews/${review.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                    {review.cover_image_url ? (
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
                </div>

                <div className="card-content" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.8rem' }}>
                        <span className="card-meta" style={{ marginBottom: 0 }}>{genre}</span>
                        {review.sub_genres && review.sub_genres.length > 0 && (
                            <span style={{ fontSize: '0.7rem', color: '#888', fontStyle: 'italic' }}>
                                {review.sub_genres.join(', ')}
                            </span>
                        )}
                    </div>
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
                    <div className="card-author" style={{ marginBottom: '0.5rem', fontSize: '0.85rem', position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {review.artist_name?.split(',').map((name, i, arr) => (
                            <span key={name.trim()}>
                                <Link href={`/artists/${encodeURIComponent(name.trim())}`} className="hover-underline" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {name.trim()}
                                </Link>
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
                </div>
            </Link>

            {(!review.review_count || review.review_count <= 1) && (
                <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', fontSize: '0.75rem', color: '#666', zIndex: 2 }}>
                    by <Link href={`/users/${review.user_id}`} className="hover-underline" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {review.profiles?.username || review.author_name}
                    </Link>
                </div>
            )}
        </div>
    )
}
