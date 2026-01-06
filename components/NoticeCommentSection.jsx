'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NoticeCommentSection({ noticeId, user }) {
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchComments()
    }, [noticeId])

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('notice_comments')
            .select(`
                *,
                profiles (
                    id,
                    username,
                    avatar_url
                )
            `)
            .eq('notice_id', noticeId)
            .order('created_at', { ascending: true })

        if (data) setComments(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user) {
            alert('로그인이 필요합니다.')
            return
        }
        if (!newComment.trim()) return

        setLoading(true)
        const { error } = await supabase
            .from('notice_comments')
            .insert({
                notice_id: noticeId,
                user_id: user.id,
                content: newComment
            })

        if (error) {
            alert('댓글 작성 실패: ' + error.message)
        } else {
            setNewComment('')
            fetchComments()
        }
        setLoading(false)
    }

    const handleDelete = async (commentId) => {
        if (!confirm('정말 삭제하시겠습니까?')) return

        const { error } = await supabase
            .from('notice_comments')
            .delete()
            .eq('id', commentId)

        if (!error) {
            fetchComments()
        }
    }

    return (
        <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <h3 style={{ marginBottom: '2rem' }}>Comments ({comments.length})</h3>

            {/* Comment List */}
            <div style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {comments.map(comment => (
                    <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            flexShrink: 0
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 'bold' }}>
                                    {comment.profiles?.username || 'Unknown User'}
                                </span>
                                {(user && (user.id === comment.user_id || user.email?.toLowerCase() === 'id01035206992@gmail.com')) && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                            <div style={{ color: '#ccc', lineHeight: 1.5 }}>{comment.content}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                                {new Date(comment.created_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && <div style={{ color: '#666', fontStyle: 'italic' }}>첫 번째 댓글을 남겨보세요!</div>}
            </div>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        color: 'white'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            rows={3}
                            style={{ width: '100%', padding: '1rem', background: '#1a1a1a', border: '1px solid #333', color: 'white', resize: 'vertical' }}
                        />
                        <button
                            type="submit"
                            className="btn"
                            disabled={loading}
                            style={{ marginTop: '0.5rem', float: 'right' }}
                        >
                            {loading ? '작성 중...' : '댓글 쓰기'}
                        </button>
                    </div>
                </form>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', background: '#1a1a1a', color: '#888' }}>
                    댓글을 작성하려면 <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>로그인</Link>이 필요합니다.
                </div>
            )}
        </div>
    )
}
