'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Footer({ initialData, user }) {
    const [isEditing, setIsEditing] = useState(false)
    const [content, setContent] = useState(initialData?.content || '문의사항: 20222 최수호')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)

        const newContent = e.target.content.value

        const { error } = await supabase
            .from('site_footer')
            .update({ content: newContent })
            .eq('id', 1)

        if (!error) {
            setContent(newContent)
            setIsEditing(false)
            router.refresh()
        } else {
            alert('저장 실패: ' + error.message)
        }
        setLoading(false)
    }

    return (
        <footer style={{
            background: '#111',
            borderTop: '1px solid #333',
            padding: '3rem 0',
            marginTop: 'auto',
            textAlign: 'center',
            color: '#666',
            fontSize: '0.9rem'
        }}>
            <div className="container">
                {isEditing ? (
                    <form onSubmit={handleSave} style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <textarea
                            name="content"
                            defaultValue={content}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#222',
                                border: '1px solid #444',
                                color: '#eee',
                                borderRadius: '4px'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button type="submit" className="btn" disabled={loading} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                                {loading ? '저장 중...' : '저장'}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                                취소
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <p style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{content}</p>

                        {user?.email === 'id01035206992@gmail.com' && (
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #333',
                                    color: '#444',
                                    padding: '0.3rem 0.6rem',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                }}
                            >
                                ✎ Footer 수정
                            </button>
                        )}
                        <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#444' }}>
                            © 2026 Ditchfork. All rights reserved.
                        </div>
                    </div>
                )}
            </div>
        </footer>
    )
}
