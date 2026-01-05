import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import AdminDeleteButton from '@/components/AdminDeleteButton'
import AdminFeatureButton from '@/components/AdminFeatureButton'
import AdminUpdateLinksButton from '@/components/AdminUpdateLinksButton'
import CommentSection from '@/components/CommentSection'

export const revalidate = 0

export async function generateMetadata({ params }) {
    const { id } = await params
    try {
        const supabase = await createClient()
        if (!supabase) return { title: 'Ditchfork' }

        const { data: review } = await supabase
            .from('reviews')
            .select('album_name, artist_name')
            .eq('id', id)
            .maybeSingle()

        if (!review) return { title: 'Review Not Found | Ditchfork' }

        return {
            title: `${review.album_name} - ${review.artist_name} | Review | Ditchfork`,
            description: `${review.artist_name}의 앨범 ${review.album_name}에 대한 심층 비평을 확인해보세요.`,
        }
    } catch (e) {
        return { title: 'Ditchfork' }
    }
}

export default async function ReviewDetailPage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
        return <div className="container section"><h1>데이터베이스 연결 오류</h1><p>관리자에게 문의해주세요.</p></div>
    }

    try {
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user || null

        // 1. Fetch the primary review
        const { data: primaryReview } = await supabase
            .from('reviews')
            .select('*, profiles(username)')
            .eq('id', id)
            .maybeSingle()

        if (!primaryReview) notFound()

        // 2. Fetch ALL reviews for this artist and album
        const { data: allReviews } = await supabase
            .from('reviews')
            .select('*, profiles(username)')
            .eq('artist_name', primaryReview.artist_name)
            .eq('album_name', primaryReview.album_name)
            .order('created_at', { ascending: false })

        return (
            <article>
                {/* Header / Hero for the Album */}
                <section className="section" style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)', padding: '3rem 0' }}>
                    <div className="container" style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                        <div style={{
                            width: '300px',
                            height: '300px',
                            flexShrink: 0,
                            position: 'relative',
                            border: '1px solid var(--border)',
                            background: '#333',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {primaryReview.cover_image_url ? (
                                <Image
                                    src={primaryReview.cover_image_url}
                                    alt={`${primaryReview.album_name} cover`}
                                    fill
                                    priority
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{ color: '#666' }}>No Cover</span>
                            )}
                        </div>
                        <div>
                            <div style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                                {primaryReview.genre}
                            </div>
                            <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                                {primaryReview.album_name}
                            </h1>
                            <div style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                                by {primaryReview.artist_name} <span style={{ fontSize: '1rem', color: '#666', fontStyle: 'normal', marginLeft: '0.5rem' }}>({primaryReview.release_year || 'Unknown'})</span>
                            </div>

                            {/* Aggregated Score Badge if multiple */}
                            {allReviews?.length > 1 && (
                                <div style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2rem' }}>
                                    {allReviews.length} Reviews • Avg: {(allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)}
                                </div>
                            )}

                            {/* Streaming Links */}
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <a
                                    href={primaryReview.spotify_url || `https://open.spotify.com/search/${encodeURIComponent(primaryReview.artist_name + ' ' + primaryReview.album_name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={primaryReview.spotify_url ? "Listen on Spotify" : "Search on Spotify"}
                                    style={{ opacity: 0.6, transition: 'opacity 0.2s' }}
                                >
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.302c-.218.358-.684.471-1.038.252-2.853-1.743-6.444-2.138-10.673-1.171-.409.092-.818-.162-.911-.571-.093-.409.162-.818.571-.911 4.634-1.06 8.59-.611 11.791 1.344.354.218.468.683.26 1.057zm1.469-3.262c-.275.447-.859.593-1.306.318-3.265-2.006-8.243-2.589-12.103-1.417-.502.152-1.032-.132-1.185-.634-.152-.501.134-1.03.633-1.183 4.416-1.341 9.907-.694 13.644 1.604.448.275.594.859.317 1.312zm.127-3.41c-3.916-2.325-10.373-2.54-14.127-1.4c-.599.182-1.237-.164-1.419-.763-.182-.599.164-1.237.763-1.419 4.309-1.308 11.442-1.053 15.918 1.603.539.32.715 1.018.395 1.557-.319.539-1.017.716-1.556.397z" />
                                    </svg>
                                </a>
                                <a
                                    href={primaryReview.apple_music_url || `https://music.apple.com/us/search?term=${encodeURIComponent(primaryReview.artist_name + ' ' + primaryReview.album_name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={primaryReview.apple_music_url ? "Listen on Apple Music" : "Search on Apple Music"}
                                    style={{ opacity: 0.6, transition: 'opacity 0.2s' }}
                                >
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                        <path d="M19.467 11.467h-2.133v-1.733c0-.4.267-.667.667-.667h1.467V7.333h-1.467c-1.467 0-2.4 1-2.4 2.4v1.734h-1.334v1.733h1.334v5.4c0 1.4.933 2.4 2.4 2.4h1.467v-1.734h-1.467c-.4 0-.667-.267-.667-.667v-5.4h2.134l-.001-1.733zM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                                        <path d="M12.5 7.5c-.828 0-1.5.672-1.5 1.5v4.613c-.31-.137-.648-.213-1-.213-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5 2.5-1.119 2.5-2.5V10.5h2V9c0-.828-.672-1.5-1.5-1.5z" />
                                    </svg>
                                </a>
                                <a
                                    href={primaryReview.youtube_music_url || `https://music.youtube.com/search?q=${encodeURIComponent(primaryReview.artist_name + ' ' + primaryReview.album_name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={primaryReview.youtube_music_url ? "Listen on YouTube Music" : "Search on YouTube Music"}
                                    style={{ opacity: 0.6, transition: 'opacity 0.2s' }}
                                >
                                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-12.5v9l6-4.5-6-4.5z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container" style={{ maxWidth: '800px', margin: '4rem auto' }}>
                    {/* Render Each Review Sequentially */}
                    {allReviews.map((rev, index) => (
                        <div key={rev.id} style={{
                            paddingBottom: '4rem',
                            marginBottom: '4rem',
                            borderBottom: index !== allReviews.length - 1 ? '1px solid #1a1a1a' : 'none'
                        }}>
                            {/* Reviewer Meta */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ color: 'var(--primary)', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
                                    {rev.rating?.toFixed(1) || '0.0'}
                                </div>
                                <div style={{ width: '1px', height: '30px', background: '#333' }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                        Reviewed by
                                    </div>
                                    <Link href={`/users/${rev.user_id}`} className="hover-underline" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem' }}>
                                        {rev.profiles?.username || 'Unknown User'}
                                    </Link>
                                </div>
                                <div style={{ color: '#666', fontSize: '0.85rem' }}>
                                    {new Date(rev.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#ccc' }}>
                                {rev.content}
                            </div>

                            {/* Individual Review Actions */}
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                                {(user?.id === rev.user_id || user?.email?.toLowerCase().trim() === 'id01035206992@gmail.com') && (
                                    <Link
                                        href={`/reviews/edit/${rev.id}`}
                                        className="btn btn-outline"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: '#444' }}
                                    >
                                        Edit
                                    </Link>
                                )}
                                <AdminUpdateLinksButton review={rev} userEmail={user?.email} />
                                <AdminFeatureButton reviewId={rev.id} userEmail={user?.email} />
                                <AdminDeleteButton table="reviews" id={rev.id} redirectTo="/reviews" userEmail={user?.email} />
                            </div>
                        </div>
                    ))}

                    <CommentSection reviewId={id} user={user} />

                    <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                        <Link href="/reviews" className="btn btn-outline">
                            ← Back to Reviews
                        </Link>
                    </div>
                </div>
            </article>
        )
    } catch (e) {
        if (e.digest === 'NEXT_NOT_FOUND' || e.digest?.startsWith('NEXT_REDIRECT')) throw e
        console.error("Review detail error:", e)
        return <div className="container section"><h1>정보를 가져오는 중 오류가 발생했습니다.</h1></div>
    }
}
