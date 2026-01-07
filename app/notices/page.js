import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const revalidate = 0

import PinButton from '@/components/PinButton'

export default async function NoticeListPage() {
    const supabase = await createClient()
    const { data: notices } = await supabase
        .from('notices')
        .select(`
            *,
            profiles (username)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

    const { data: { user } } = await supabase.auth.getUser()
    const isAdmin = user?.email === 'id01035206992@gmail.com'

    return (
        <main className="container section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Information</h1>
                {isAdmin && (
                    <Link href="/notices/new" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        글쓰기
                    </Link>
                )}
            </div>

            <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', padding: '1rem', borderBottom: '1px solid #333', color: '#888', fontWeight: 700, fontSize: '0.9rem', alignItems: 'center' }}>
                    {isAdmin && <div style={{ width: '40px', textAlign: 'center' }}>Pin</div>}
                    <div style={{ flex: 1, textAlign: 'center' }}>제목</div>
                    <div style={{ width: '100px', textAlign: 'center' }}>작성자</div>
                    <div style={{ width: '100px', textAlign: 'center' }}>날짜</div>
                </div>

                {/* List Rows */}
                {notices && notices.length > 0 ? (
                    notices.map((notice, index) => (
                        <div key={notice.id} style={{ display: 'flex', alignItems: 'stretch', borderBottom: index !== notices.length - 1 ? '1px solid #2a2a2a' : 'none' }}>
                            {isAdmin && (
                                <div style={{ width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #2a2a2a' }}>
                                    <PinButton noticeId={notice.id} isPinned={notice.is_pinned} />
                                </div>
                            )}
                            <Link
                                href={`/notices/${notice.id}`}
                                style={{
                                    display: 'flex',
                                    padding: '1rem',
                                    textDecoration: 'none',
                                    color: '#eee',
                                    alignItems: 'center',
                                    transition: 'background 0.2s',
                                    flex: 1
                                }}
                                className="notice-row"
                            >
                                <div style={{ flex: 1, paddingRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {notice.is_pinned && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: '#888' }}>
                                            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2z" />
                                        </svg>
                                    )}
                                    {notice.title}
                                </div>
                                <div style={{ width: '100px', textAlign: 'center', fontSize: '0.9rem', color: '#ccc' }}>
                                    {notice.profiles?.username || 'Admin'}
                                </div>
                                <div style={{ width: '100px', textAlign: 'center', fontSize: '0.85rem', color: '#888' }}>
                                    {new Date(notice.created_at).toLocaleDateString()}
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        등록된 공지사항이 없습니다.
                    </div>
                )}
            </div>
        </main>
    )
}
