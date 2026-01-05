import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function PublicProfilePage({ params }) {
    const supabase = createClient()
    const { id } = params

    // Fetch Public Profile
    const { data: profile, error } = await (await supabase)
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
        </div>
    )
}
