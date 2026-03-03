import { createClient } from '@/utils/supabase/server'
import ReviewCard from '@/components/ReviewCard'
import Link from 'next/link'
import { groupReviews } from '@/utils/reviewAggregation'

export const revalidate = 0

export default async function BooksPage({ searchParams }) {
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
        .eq('category', 'book') // Filter for books
        .order('created_at', { ascending: false })
        .range(0, (page * perPage * 5) - 1)

    if (search) {
        query = query.or(`album_name.ilike.%${search}%,artist_name.ilike.%${search}%`)
    }

    if (searchParams.genre) {
        query = query.eq('genre', searchParams.genre)
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
                <h1>{search ? `'${search}' 검색 결과` : 'Book Reviews'}</h1>
                <Link href="/reviews/new?mode=book" className="btn">
                    + 리뷰 작성
                </Link>
            </div>

            {/* KDC Genre Filter */}
            <div style={{ marginBottom: '3rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link
                    href="/books"
                    className="btn btn-outline"
                    style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.9rem',
                        background: !searchParams.genre ? 'var(--accent)' : 'transparent',
                        color: !searchParams.genre ? 'var(--background)' : 'var(--accent)'
                    }}
                >
                    All
                </Link>
                {["총류", "철학", "종교", "사회과학", "자연과학", "기술과학", "예술", "언어", "문학", "역사"].map(g => (
                    <Link
                        key={g}
                        href={`/books?genre=${g}`}
                        className="btn btn-outline"
                        style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.9rem',
                            background: searchParams.genre === g ? 'var(--accent)' : 'transparent',
                            color: searchParams.genre === g ? 'var(--background)' : 'var(--accent)'
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
                        <div style={{ padding: '4rem', textAlign: 'center', background: '#1a1a1a', border: '1px solid #333' }}>
                            <p>
                                {page > 1 ? '더 이상 리뷰가 없습니다.' : '아직 작성된 도서 리뷰가 없습니다.'}
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
                                    href={`/books?page=${page - 1}${search ? `&q=${search}` : ''}`}
                                    className={`btn btn-outline ${!hasPrev ? 'disabled' : ''}`}
                                    style={{ pointerEvents: hasPrev ? 'auto' : 'none', opacity: hasPrev ? 1 : 0.5 }}
                                >
                                    Previous
                                </Link>
                                <span style={{ display: 'flex', alignItems: 'center', fontSize: '1.2rem', fontWeight: 600 }}>
                                    {page}
                                </span>
                                <Link
                                    href={`/books?page=${page + 1}${search ? `&q=${search}` : ''}`}
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
