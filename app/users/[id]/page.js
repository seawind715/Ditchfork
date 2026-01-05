import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import AdminBanButton from '@/components/AdminBanButton'
import ReviewCard from '@/components/ReviewCard'

export const revalidate = 0

export default async function PublicProfilePage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
        return <div className="container section"><h1>데이터베이스 연결 오류</h1></div>
    }

    let profile = null
    let reviews = []
    let isAdmin = false
    let currentUser = null

    try {
        // 1. Get current logged in user (to check admin status)
        const { data: authData } = await supabase.auth.getUser()
        currentUser = authData?.user
        const adminEmail = 'id01035206992@gmail.com'
        isAdmin = currentUser?.email?.toLowerCase() === adminEmail.toLowerCase()

        // 2. Fetch Public Profile
        const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        profile = data

        if (!profile) {
            notFound()
        }

        // 3. Fetch User's Reviews
        const { data: reviewData } = await supabase
            .from('reviews')
            .select(`
                *,
                profiles (
                    username
                )
            `)
            .eq('user_id', id)
            .order('created_at', { ascending: false })

        reviews = reviewData || []
    } catch (e) {
        if (e.digest === 'NEXT_NOT_FOUND' || e.digest?.startsWith('NEXT_REDIRECT')) throw e
        console.error("Profile fetch error:", e)
        return <div className="container section"><h1>정보를 가져오는 중 오류가 발생했습니다.</h1></div>
    }

    return (
        <div className="container section" style={{ maxWidth: '1000px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto 4rem', textAlign: 'center' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'var(--border)',
                    margin: '0 auto 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    boxShadow: '0 0 20px rgba(255,0,0,0.1)'
                }}>
                    👤
                </div>

                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{profile.username || '알 수 없는 사용자'}</h1>

                {profile.is_banned && (
                    <div style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '2rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', border: '1px solid var(--primary)' }}>
                        🚫 이 유저는 현재 정지된 상태입니다.
                    </div>
                )}

                <div style={{ background: '#111', padding: '2rem', border: '1px solid var(--border)', textAlign: 'left', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <strong style={{ color: '#888', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>성별</strong>
                        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : profile.gender === 'other' ? '기타' : '정보 없음'}</div>
                    </div>

                    <div>
                        <strong style={{ color: '#888', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>거주지</strong>
                        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{profile.residence || '정보 없음'}</div>
                    </div>
                </div>

                {isAdmin && currentUser?.id !== profile.id && (
                    <div style={{ marginTop: '2rem' }}>
                        <AdminBanButton userId={profile.id} initialIsBanned={profile.is_banned} />
                    </div>
                )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '4rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', fontWeight: 800 }}>
                    <span style={{ color: 'var(--primary)' }}>{profile.username}</span>님의 리뷰 ({reviews?.length || 0})
                </h2>

                {reviews && reviews.length > 0 ? (
                    <div className="grid grid-cols-4" style={{ gap: '1rem' }}>
                        {reviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', color: '#666', padding: '6rem 0', background: '#0a0a0a', border: '1px dashed #333', borderRadius: '8px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💿</div>
                        아직 작성한 리뷰가 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}
