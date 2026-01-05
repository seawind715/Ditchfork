'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Hero({ initialData, user }) {
    const [isEditing, setIsEditing] = useState(false)
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Get form values
        const form = e.target
        const headline = form.headline.value
        const subheadline = form.subheadline.value

        const { error } = await supabase
            .from('hero_content')
            .update({ headline, subheadline })
            .eq('id', data.id)

        if (!error) {
            setData({ ...data, headline, subheadline })
            setIsEditing(false)
            router.refresh()
        } else {
            alert('Failed to update')
        }
        setLoading(false)
    }

    if (isEditing) {
        return (
            <section className="section" style={{ background: '#0a0a0a', borderBottom: '1px solid #333' }}>
                <div className="container" style={{ display: 'flex', gap: '2rem', alignItems: 'center', minHeight: '400px' }}>
                    <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>헤드라인</label>
                            <input name="headline" defaultValue={data.headline} style={{ fontSize: '2rem', width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>설명 (서브 헤드라인)</label>
                            <textarea name="subheadline" defaultValue={data.subheadline} rows={3} style={{ width: '100%' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn" disabled={loading}>{loading ? '저장 중...' : '저장'}</button>
                            <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>취소</button>
                        </div>
                    </form>
                </div>
            </section>
        )
    }

    const review = Array.isArray(data?.reviews) ? data.reviews[0] : data?.reviews

    return (
        <section className="section" style={{ background: '#0a0a0a', borderBottom: '1px solid #333', position: 'relative', overflow: 'hidden' }}>
            {/* Background Image Element (Optional Blur Effect) */}
            {review?.cover_image_url && (
                <div style={{ position: 'absolute', inset: 0, opacity: 0.15, filter: 'blur(40px)', zIndex: 0 }}>
                    <Image
                        src={review.cover_image_url}
                        alt=""
                        fill
                        priority
                        style={{ objectFit: 'cover' }}
                    />
                </div>
            )}

            <div className="container" style={{ display: 'flex', gap: '3rem', alignItems: 'center', minHeight: '400px', position: 'relative', zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {review ? 'Featured Review' : 'Feature'}
                    </span>

                    {review ? (
                        <>
                            <Link href={`/reviews/${review.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <h1 style={{ fontSize: '3.5rem', margin: '0.5rem 0', lineHeight: 1.1, cursor: 'pointer' }}>
                                    {review.album_name}
                                </h1>
                            </Link>
                            <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontStyle: 'italic', color: '#ccc' }}>
                                by {review.artist_name}
                            </div>
                            <p style={{ fontSize: '1.1rem', color: '#999', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {review.content}
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <Link href={`/reviews/${review.id}`} className="btn" style={{ padding: '0.8rem 1.5rem' }}>
                                    Read Review →
                                </Link>
                                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary)' }}>
                                    Rating: {review.rating?.toFixed(1) || '0.0'}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontSize: '3.5rem', margin: '0.5rem 0', wordBreak: 'keep-all' }}>{data.headline}</h1>
                            <p style={{ fontSize: '1.2rem', color: '#999', marginBottom: '1.5rem', wordBreak: 'keep-all' }}>
                                {data.subheadline}
                            </p>
                        </>
                    )}

                    {user?.email?.toLowerCase().trim() === 'id01035206992@gmail.com' && !review && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                background: 'transparent',
                                border: '1px solid #333',
                                color: '#666',
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                marginTop: '1rem'
                            }}>
                            ✎ 텍스트 수정
                        </button>
                    )}
                </div>

                <Link href={review ? `/reviews/${review.id}` : '#'} style={{ flex: 1, textDecoration: 'none', display: 'block', maxWidth: '400px' }}>
                    <div style={{
                        width: '100%',
                        height: '400px',
                        position: 'relative',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid #333',
                        background: '#1a1a1a',
                        cursor: review ? 'pointer' : 'default',
                        overflow: 'hidden'
                    }}>
                        {review?.cover_image_url ? (
                            <Image
                                src={review.cover_image_url}
                                alt={review.album_name}
                                fill
                                priority
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <span style={{ color: '#444' }}>No Cover Image</span>
                        )}
                    </div>
                </Link>
            </div>
        </section>
    )
}
