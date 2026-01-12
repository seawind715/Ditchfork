import { createClient } from '@/utils/supabase/server'
import ReviewCard from '@/components/ReviewCard'
import Link from 'next/link'
import { groupReviews } from '@/utils/reviewAggregation'

export const revalidate = 0

export default async function MoviesPage({ searchParams }) {
    const supabase = await createClient()
    const page = Number((await searchParams).page) || 1
    const perPage = 40
    const { q: search } = await searchParams

    let query = supabase
        .from('reviews')
        .select(`
            *,
            profiles (
                username
            )
        `)
        .eq('category', 'movie') // Filter for movies
        .order('created_at', { ascending: false })
        .range(0, (page * perPage * 5) - 1)

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
        error = e
    }

    // Grouping
    const allGrouped = groupReviews(rawReviews)

    // Slice for Pagination
    const start = (page - 1) * perPage
    const end = start + perPage
    const reviews = allGrouped.slice(start, end)
    const hasNext = allGrouped.length > end
    const hasPrev = page > 1

    return (
        <div className="container section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1>{search ? `'${search}' 검색 결과` : 'Movie Reviews'}</h1>
                <Link href="/reviews/new" className="btn">
                    + 리뷰 작성
                </Link>
            </div>

            {error ? (
                <div style={{ color: 'red' }}>Error loading reviews</div>
            ) : (
                <>
                    {reviews?.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', background: '#1a1a1a', border: '1px solid #333' }}>
                            <p>
                                {page > 1 ? '더 이상 리뷰가 없습니다.' : '아직 작성된 영화 리뷰가 없습니다.'}
                            </p>
                            {page === 1 && <p style={{ marginTop: '1rem' }}>첫 번째 리뷰의 주인공이 되어보세요!</p>}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-4">
                                {reviews.map(review => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
                                <Link
                                    href={`/movies?page=${page - 1}${search ? `&q=${search}` : ''}`}
                                    className={`btn btn-outline ${!hasPrev ? 'disabled' : ''}`}
                                    style={{ pointerEvents: hasPrev ? 'auto' : 'none', opacity: hasPrev ? 1 : 0.5 }}
                                >
                                    Previous
                                </Link>
                                <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', fontWeight: 600 }}>
                                    {page}
                                </span>
                                <Link
                                    href={`/movies?page=${page + 1}${search ? `&q=${search}` : ''}`}
                                    className={`btn btn-outline ${!hasNext ? 'disabled' : ''}`}
                                    style={{ pointerEvents: hasNext ? 'auto' : 'none', opacity: hasNext ? 1 : 0.5 }}
                                >
                                    Next
                                </Link>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}
