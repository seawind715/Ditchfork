import Hero from '@/components/Hero'
import NoticeSection from '@/components/NoticeSection'
import Footer from '@/components/Footer'
import ScoreGuide from '@/components/ScoreGuide'
import ReviewCard from '@/components/ReviewCard'
import { createClient } from '@/utils/supabase/server'
import { groupReviews } from '@/utils/reviewAggregation'

export default async function Home() {
  const supabase = await createClient()

  if (!supabase) {
    return (
      <main className="container section">
        <h1>환경 설정 오류</h1>
        <p>Supabase 환경 변수가 설정되지 않았습니다. Vercel 설정을 확인해주세요.</p>
      </main>
    )
  }

  let results: any[] = []
  try {
    // Parallel data fetching
    results = await Promise.all([
      supabase
        .from('hero_content')
        .select(`
            *,
            reviews (
                *,
                profiles (username)
            )
        `)
        .eq('active', true)
        .maybeSingle(),
      supabase
        .from('site_footer')
        .select('*')
        .maybeSingle(),
      supabase
        .from('reviews')
        .select(`
          *,
          profiles (username)
        `)
        .order('created_at', { ascending: false })
        .limit(30), // Fetch more for grouping
      supabase
        .from('notices')
        .select(`
            *,
            profiles (username)
        `)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.auth.getUser()
    ])
  } catch (err) {
    console.error("Data fetching error:", err)
    return (
      <main className="container section">
        <h1>데이터 가져오기 오류</h1>
        <p>서버에서 데이터를 가져오는 중 오류가 발생했습니다.</p>
      </main>
    )
  }

  const heroData = results[0]?.data
  const footerData = results[1]?.data
  const allRawReviews = results[2]?.data || []
  const notices = results[3]?.data || []
  const user = results[4]?.data?.user || null

  // Aggregation
  const groupedReviews = groupReviews(allRawReviews)
  const newReviews = groupedReviews.slice(0, 10) // Top 10 grouped

  // New Release (current year - 3)
  const currentYear = new Date().getFullYear()
  const releaseLimit = currentYear - 3
  const newReleases = groupedReviews
    .filter(r => parseInt(r.release_year) >= releaseLimit)
    .slice(0, 10)

  const defaultHero = {
    id: 'default',
    headline: '2026년 최고의 앨범',
    subheadline: 'Ditchfork가 엄선한 최고의 앨범과 트랙들을 만나보세요. 가장 솔직한 당신만의 음악 이야기를 들려주세요.'
  }

  return (
    <main>
      <Hero initialData={heroData || defaultHero} user={user} />
      <NoticeSection notices={notices} user={user} />
      <ScoreGuide />

      {!user && (
        <div style={{ background: '#111', color: '#888', textAlign: 'center', padding: '1rem', borderBottom: '1px solid #222' }}>
          로그인하면 리뷰와 댓글을 작성하고, 페스티벌 정보를 공유할 수 있습니다. <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>로그인하기</a>
        </div>
      )}

      {/* New Review Section */}
      <section className="section container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: 0 }}>New Review</h2>
          <a href="/reviews" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>전체 보기</a>
        </div>

        <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', scrollbarWidth: 'thin', scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
          {newReviews.length > 0 ? (
            newReviews.map((review: any) => (
              <div key={review.id} style={{ minWidth: '220px', flex: '0 0 auto', scrollSnapAlign: 'start' }}>
                <ReviewCard review={review} />
              </div>
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: '4rem', background: '#111', border: '1px solid #222' }}>
              <p style={{ color: '#666' }}>최근 등록된 리뷰가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* New Release Section */}
      <section className="section container" style={{ borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: 0 }}>New Release</h2>
          <span style={{ fontSize: '0.9rem', color: '#666' }}>{releaseLimit}~{currentYear} 발매 앨범</span>
        </div>

        <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', scrollbarWidth: 'thin', scrollSnapType: 'x mandatory' }} className="hide-scrollbar">
          {newReleases.length > 0 ? (
            newReleases.map((review: any) => (
              <div key={review.id} style={{ minWidth: '220px', flex: '0 0 auto', scrollSnapAlign: 'start' }}>
                <ReviewCard review={review} />
              </div>
            ))
          ) : (
            <div style={{ width: '100%', textAlign: 'center', padding: '4rem', background: '#111', border: '1px solid #222' }}>
              <p style={{ color: '#666' }}>최근 3년 내 발매된 앨범에 대한 리뷰가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      <Footer initialData={footerData} user={user} />
    </main>
  );
}
