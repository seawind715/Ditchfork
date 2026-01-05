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
                    <span className="card-meta">{genre}</span>
                    <h3 className="card-title" style={{
                        fontSize: '1.1rem',
                        marginBottom: '0.4rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {review.album_name}
                    </h3>
                    <div className="card-author" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        {review.artist_name}
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

            <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', fontSize: '0.75rem', color: '#666', zIndex: 2 }}>
                by <Link href={`/users/${review.user_id}`} className="hover-underline" style={{ color: 'inherit', textDecoration: 'none' }}>
                    {review.profiles?.username || review.author_name}
                </Link>
            </div>
        </div>
    )
}
