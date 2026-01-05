import Hero from '@/components/Hero'
import Footer from '@/components/Footer'
import ReviewCard from '@/components/ReviewCard'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  // Parallel data fetching to optimize performance and reduce wait time
  const [
    { data: heroData },
    { data: footerData },
    { data: recentReviews },
    { data: { user } }
  ] = await Promise.all([
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
      .single(),
    supabase
      .from('site_footer')
      .select('*')
      .eq('id', 1)
      .single(),
    supabase
      .from('reviews')
      .select(`
        *,
        profiles (username)
      `)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.auth.getUser()
  ])

  const defaultHero = {
    id: 'default',
    headline: '2026년 최고의 앨범',
    subheadline: 'Ditchfork가 엄선한 최고의 앨범과 트랙들을 만나보세요. 가장 솔직한 당신만의 음악 이야기를 들려주세요.'
  }

  return (
    <main>
      <Hero initialData={heroData || defaultHero} user={user} />

      {/* Reference Sites Section */}
      <section style={{ borderBottom: '1px solid var(--border)', padding: '2rem 0', background: '#0a0a0a' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4rem' }}>
          <span style={{ color: '#666', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>References</span>
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
            <a href="https://rateyourmusic.com" target="_blank" rel="noopener noreferrer" style={{ opacity: 0.7, transition: 'opacity 0.3s' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Rate_Your_Music_logo.svg" alt="RateYourMusic" style={{ height: '24px', filter: 'brightness(1.5)' }} />
            </a>
            <a href="https://albumoftheyear.org" target="_blank" rel="noopener noreferrer" style={{ opacity: 0.7, transition: 'opacity 0.3s' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Albumoftheyear2.png" alt="AlbumOfTheYear" style={{ height: '32px', filter: 'brightness(1.5)' }} />
            </a>
          </div>
        </div>
      </section>

      {!user && (
        <div style={{ background: '#111', color: '#888', textAlign: 'center', padding: '1rem', borderBottom: '1px solid #222' }}>
          로그인하면 리뷰와 댓글을 작성하고, 페스티벌 정보를 공유할 수 있습니다. <a href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>로그인하기</a>
        </div>
      )}

      <section className="section container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: 0 }}>최신 리뷰</h2>
          <a href="/reviews" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>전체 보기</a>
        </div>

        <div className="grid grid-cols-3">
          {recentReviews && recentReviews.length > 0 ? (
            recentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '4rem', background: '#111', border: '1px solid #222' }}>
              <p style={{ color: '#666' }}>최근 등록된 리뷰가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      <Footer initialData={footerData} user={user} />
    </main>
  );
}
