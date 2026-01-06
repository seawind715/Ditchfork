import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const revalidate = 0

export default async function NoticeListPage() {
    const supabase = await createClient()
    const { data: notices } = await supabase
        .from('notices')
        .select(`
            *,
            profiles (username)
        `)
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
                <div style={{ display: 'flex', padding: '1rem', borderBottom: '1px solid #333', color: '#888', fontWeight: 700, fontSize: '0.9rem' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>제목</div>
                    <div style={{ width: '100px', textAlign: 'center' }}>작성자</div>
                    <div style={{ width: '100px', textAlign: 'center' }}>날짜</div>
                </div>

                {/* List Rows */}
                {notices && notices.length > 0 ? (
                    notices.map((notice, index) => (
                        <div key={notice.id}>
                            <Link
                                href={`/notices/${notice.id}`}
                                style={{
                                    display: 'flex',
                                    padding: '1rem',
                                    borderBottom: index !== notices.length - 1 ? '1px solid #2a2a2a' : 'none',
                                    textDecoration: 'none',
                                    color: '#eee',
                                    alignItems: 'center',
                                    transition: 'background 0.2s'
                                }}
                                className="notice-row"
                            >
                                <div style={{ flex: 1, paddingRight: '1rem' }}>
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
