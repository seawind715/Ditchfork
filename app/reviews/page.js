import { createClient } from '@/utils/supabase/server'
import ReviewCard from '@/components/ReviewCard'
import Link from 'next/link'
import { groupReviews } from '@/utils/reviewAggregation'

export const revalidate = 0 // Disable caching for now to see new reviews immediately

export default async function ReviewsPage({ searchParams }) {
    const supabase = await createClient()
    const { genre, q: search } = await searchParams

    if (!supabase) {
        return <div className="container section"><h1>데이터베이스 연결 오류</h1></div>
    }

    let query = supabase
        .from('reviews')
        .select(`
            *,
            profiles (
                username
            )
        `)
        .order('created_at', { ascending: false })
        .limit(100) // Increase limit for grouping

    if (genre) {
        query = query.eq('genre', genre)
    }

    if (search) {
        query = query.or(`album_name.ilike.%${search}%,artist_name.ilike.%${search}%`)
    }

    let rawReviews = []
    let error = null
    try {
        const result = await query
        rawReviews = result.data || []
        error = result.error
    } catch (e) {
        if (e.digest === 'NEXT_NOT_FOUND' || e.digest?.startsWith('NEXT_REDIRECT')) throw e
        error = e
    }

    // Grouping
    const reviews = groupReviews(rawReviews)

    const genres = ['Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical Music', 'K-Pop', 'Ballad', 'Folk', 'Experimental', 'Uncategorized']

    return (
        <div className="container section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>{search ? `'${search}' 검색 결과` : 'Reviews'}</h1>
                <Link href="/reviews/new" className="btn">
                    + 리뷰 작성
                </Link>
            </div>

            {/* Genre Filter */}
            <div style={{ marginBottom: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                    href="/reviews"
                    className="btn btn-outline"
                    style={{
                        background: !genre ? 'var(--accent)' : 'transparent',
                        color: !genre ? 'var(--background)' : 'var(--accent)'
                    }}
                >
                    All
                </Link>
                {genres.map(g => (
                    <Link
                        key={g}
                        href={`/reviews?genre=${g}`}
                        className="btn btn-outline"
                        style={{
                            background: genre === g ? 'var(--accent)' : 'transparent',
                            color: genre === g ? 'var(--background)' : 'var(--accent)'
                        }}
                    >
                        {g}
                    </Link>
                ))}
            </div>

            {error ? (
                <div style={{ color: 'red' }}>Error loading reviews</div>
            ) : (
                <>
                    {reviews?.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                            <p>아직 작성된 리뷰가 없습니다.</p>
                            <p style={{ marginTop: '1rem' }}>첫 번째 리뷰의 주인공이 되어보세요!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4">
                            {reviews.map(review => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
