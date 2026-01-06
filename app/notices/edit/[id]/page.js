'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

export default function EditNoticePage({ params }) {
    const { id } = use(params)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchNotice = async () => {
            // 1. Check Admin
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || user.email !== 'id01035206992@gmail.com') {
                alert('관리자만 접근할 수 있습니다.')
                router.push('/notices')
                return
            }

            // 2. Fetch Notice Data
            const { data: notice, error } = await supabase
                .from('notices')
                .select('*')
                .eq('id', id)
                .single()

            if (error || !notice) {
                alert('공지사항을 불러올 수 없습니다.')
                router.push('/notices')
                return
            }

            setTitle(notice.title)
            setContent(notice.content)
            setLoading(false)
        }
        fetchNotice()
    }, [id, router, supabase])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        const { error } = await supabase
            .from('notices')
            .update({
                title,
                content,
                // optionally update 'created_at' to 'now()' if you want to bump the date, 
                // typically we keep original creation date or add 'updated_at' column.
                // keeping simple for now.
            })
            .eq('id', id)

        if (error) {
            alert('공지 수정 실패: ' + error.message)
            setSubmitting(false)
        } else {
            alert('공지사항이 수정되었습니다.')
            router.push(`/notices/${id}`)
        }
    }

    if (loading) return <div className="container section">로딩 중...</div>

    return (
        <main className="container section" style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>공지사항 수정</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="공지 제목을 입력하세요"
                        style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: 'white' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={15}
                        placeholder="공지 내용을 입력하세요"
                        style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', resize: 'vertical' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="btn btn-outline"
                        style={{ padding: '0.8rem 1.5rem' }}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="btn"
                        disabled={submitting}
                        style={{ padding: '0.8rem 1.5rem' }}
                    >
                        {submitting ? '수정 완료' : '수정하기'}
                    </button>
                </div>
            </form>
        </main>
    )
}
