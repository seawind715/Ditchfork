'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function ProfileCompletionModal({ user }) {
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const checkProfile = async () => {
            if (!user) return

            // If we are already on the profile page with no extra params, maybe we don't need to force the modal 
            // BUT the user request says "First login or not entered yet -> Force popup". 
            // So we should enforce it everywhere to be safe, or maybe exclude /profile if they are manually editing?
            // Actually, a modal is better than redirecting to /profile because it's less intrusive to navigation history.

            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single()

            if (!profile || !profile.username || !profile.username.match(/^\d{5}\s+.+$/)) {
                setIsOpen(true)
            }
        }
        checkProfile()
    }, [user, pathname, supabase])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.target)
        const studentId = formData.get('studentId')
        const studentName = formData.get('studentName')
        const fullUsername = `${studentId} ${studentName}`

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                username: fullUsername,
                updated_at: new Date().toISOString()
            })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Success
            alert('정보가 저장되었습니다.')
            setIsOpen(false)
            router.refresh()
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        // Force reload to completely clear state
        window.location.reload()
    }

    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                background: '#1a1a1a',
                border: '1px solid var(--primary)',
                padding: '2rem',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center' }}>
                    환영합니다! 👋
                </h2>
                <p style={{ textAlign: 'center', color: '#ccc', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    원활한 커뮤니티 활동을 위해<br />
                    <strong>학번</strong>과 <strong>이름</strong>을 입력해주세요.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '0.3rem' }}>학번 (5자리)</label>
                        <input
                            name="studentId"
                            placeholder="예: 10901"
                            pattern="\d{5}"
                            title="5자리 학번을 입력해주세요"
                            required
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#111',
                                border: '1px solid #333',
                                color: 'white',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '0.3rem' }}>이름</label>
                        <input
                            name="studentName"
                            placeholder="예: 김동국"
                            required
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                background: '#111',
                                border: '1px solid #333',
                                color: 'white',
                                borderRadius: '4px'
                            }}
                        />
                    </div>

                    {error && <div style={{ color: 'red', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}

                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <button
                            type="submit"
                            className="btn"
                            disabled={loading}
                            style={{ width: '100%', padding: '0.8rem' }}
                        >
                            {loading ? '저장 중...' : '시작하기'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSignOut}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#666',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            로그아웃
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
