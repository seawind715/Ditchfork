import { createClient } from '@/utils/supabase/server'
import ReviewCard from '@/components/ReviewCard'
import { groupReviews } from '@/utils/reviewAggregation'
import Link from 'next/link'

export const revalidate = 0

export default async function ArtistPage({ params }) {
    // Artist name is passed in the URL, e.g., /artists/Radiohead
    // We need to decode it as it might contain spaces or special chars
    const artistNameRaw = decodeURIComponent(params.name)
    const supabase = createClient()

    if (!supabase) {
        return (
            <div className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Database Connection Error</h1>
                <p style={{ color: '#888' }}>Please check your environment variables.</p>
            </div>
        )
    }

    try {
        // Fetch all reviews for this artist
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                *,
                profiles (
                    username,
                    avatar_url
                )
            `)
            .ilike('artist_name', artistNameRaw)
            .order('created_at', { ascending: false })

        if (error) throw error

        if (!reviews || reviews.length === 0) {
            return (
                <div className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{artistNameRaw}</h1>
                    <p style={{ color: '#888' }}>리뷰를 찾을 수 없습니다.</p>
                    <Link href="/" className="btn" style={{ marginTop: '2rem', display: 'inline-block' }}>홈으로 돌아가기</Link>
                </div>
            )
        }

        // Group by album to avoid showing the same album multiple times if it has multiple reviews
        const groupedReviews = groupReviews(reviews)
        const displayArtistName = groupedReviews[0]?.artist_name || artistNameRaw

        return (
            <div className="container" style={{ paddingBottom: '10rem' }}>
                <div style={{ paddingTop: '10rem', marginBottom: '5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--brand)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Artist
                    </span>
                    <h1 style={{ fontSize: '4rem', fontWeight: 900, marginTop: '0.5rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
                        {displayArtistName}
                    </h1>
                    <p style={{ color: '#888', maxWidth: '600px' }}>
                        {groupedReviews.length} Albums reviewed
                    </p>
                </div>

                <div className="grid grid-cols-4" style={{ gap: '2rem' }}>
                    {groupedReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            </div>
        )
    } catch (error) {
        console.error('Artist page error:', error)
        return (
            <div className="container" style={{ paddingTop: '10rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>데이터를 불러오는 중 오류가 발생했습니다.</h1>
                <Link href="/" className="btn">홈으로 돌아가기</Link>
            </div>
        )
    }
}
