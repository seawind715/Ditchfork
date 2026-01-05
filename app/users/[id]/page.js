import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import AdminBanButton from '@/components/AdminBanButton'

export const revalidate = 0

export default async function PublicProfilePage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Get current logged in user (to check admin status)
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const adminEmail = 'id01035206992@gmail.com'
    const isAdmin = currentUser?.email?.toLowerCase() === adminEmail.toLowerCase()

    // 2. Fetch Public Profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !profile) {
        notFound()
    }

    return (
        <div className="container section" style={{ maxWidth: '600px', textAlign: 'center' }}>
            <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'var(--border)',
                margin: '0 auto 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem'
            }}>
                👤
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{profile.username || '알 수 없는 사용자'}</h1>

            {profile.is_banned && (
                <div style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1rem' }}>
                    🚫 이 유저는 현재 정지된 상태입니다.
                </div>
            )}

            <div style={{ background: '#151515', padding: '2rem', border: '1px solid var(--border)', textAlign: 'left' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>성별</strong>
                    <div style={{ fontSize: '1.2rem' }}>{profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : profile.gender === 'other' ? '기타' : '정보 없음'}</div>
                </div>

                <div>
                    <strong style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>거주지</strong>
                    <div style={{ fontSize: '1.2rem' }}>{profile.residence || '정보 없음'}</div>
                </div>
            </div>

            {isAdmin && currentUser?.id !== profile.id && (
                <AdminBanButton userId={profile.id} initialIsBanned={profile.is_banned} />
            )}
        </div>
    )
}
