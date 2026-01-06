'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfileForm({ user, profile }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // Parse existing username into ID and Name if possible
    const initialUsername = profile?.username || ''
    // Regex to see if it starts with 5 digits
    const match = initialUsername.match(/^(\d{5})\s+(.+)$/)
    const initialStudentId = match ? match[1] : (initialUsername.match(/^\d{5}/) ? initialUsername.substring(0, 5) : '')
    const initialName = match ? match[2] : (initialUsername.replace(/^\d{5}\s*/, ''))

    const isNewUser = !profile?.username

    const handleUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const formData = new FormData(e.target)
        const studentId = formData.get('studentId')
        const studentName = formData.get('studentName')

        const fullUsername = `${studentId} ${studentName}`

        const updates = {
            id: user.id,
            username: fullUsername,
            gender: formData.get('gender'),
            residence: formData.get('residence'),
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('profiles')
            .upsert(updates) // Upsert to handle creation if missing

        if (error) {
            setMessage('Error: ' + error.message)
        } else {
            setMessage('프로필이 업데이트되었습니다!')
            router.refresh()
        }
        setLoading(false)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#222',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#666'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{profile?.username || user.email.split('@')[0]}</div>
                    <div style={{ color: '#888', fontSize: '0.9rem' }}>{user.email}</div>
                </div>
            </div>

            {isNewUser && (
                <div style={{ background: 'rgba(255, 51, 51, 0.1)', border: '1px solid var(--primary)', padding: '1rem', marginBottom: '2rem', borderRadius: '4px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>환영합니다!</h3>
                    <p>원활한 커뮤니티 활동을 위해 <strong>학번</strong>과 <strong>이름</strong>을 꼭 입력해주세요.</p>
                </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="grid grid-cols-2" style={{ gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>학번</label>
                        <input name="studentId" defaultValue={initialStudentId} placeholder="10901" required style={{ width: '100%' }} pattern="\d{5}" title="5자리 학번을 입력해주세요" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>이름</label>
                        <input name="studentName" defaultValue={initialName} placeholder="김동국" required style={{ width: '100%' }} />
                    </div>
                </div>
                <p style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: '-1rem' }}>
                    ※ 꼭 본인의 학번과 이름을 정확히 입력해주세요.
                </p>

                <div className="grid grid-cols-2" style={{ gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Gender</label>
                        <select name="gender" defaultValue={profile?.gender || ''} style={{ width: '100%' }}>
                            <option value="">Select...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>Residence</label>
                        <input name="residence" defaultValue={profile?.residence || ''} placeholder="City, Country" style={{ width: '100%' }} />
                    </div>
                </div>

                {message && <div style={{ color: 'var(--primary)', fontWeight: 600 }}>{message}</div>}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn" disabled={loading} style={{ padding: '0.8rem 1.5rem', width: 'auto' }}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="btn btn-outline"
                        style={{ borderColor: '#333', color: '#666', width: 'auto', padding: '0.8rem 1.5rem' }}
                    >
                        Sign Out
                    </button>
                </div>
            </form>
        </div>
    )
}
