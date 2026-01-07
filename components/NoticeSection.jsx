'use client'

import Link from 'next/link'

export default function NoticeSection({ notices, user }) {
    const isAdmin = user?.email === 'id01035206992@gmail.com'

    // If no notices AND not admin, hide the section
    if ((!notices || notices.length === 0) && !isAdmin) return null

    return (
        <section className="container section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Information</h3>
                    {isAdmin && (
                        <Link
                            href="/notices/new"
                            title="공지 작성"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#333',
                                color: '#ccc'
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </Link>
                    )}
                </div>
                <Link href="/notices" style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'none' }}>
                    더보기 +
                </Link>
            </div>
            <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}>
                {notices && notices.length > 0 ? (
                    notices.map((notice, index) => (
                        <Link
                            key={notice.id}
                            href={`/notices/${notice.id}`}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.8rem 1rem',
                                borderBottom: index !== notices.length - 1 ? '1px solid #2a2a2a' : 'none',
                                textDecoration: 'none',
                                color: '#eee',
                                transition: 'background 0.2s'
                            }}
                            className="notice-item"
                            onMouseEnter={(e) => e.currentTarget.style.background = '#252525'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {notice.is_pinned && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: '#888', flexShrink: 0 }}>
                                        <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6l1 1 1-1v-6h5v-2z" />
                                    </svg>
                                )}
                                <span style={{ fontWeight: 500 }}>{notice.title}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#888', flexShrink: 0 }}>
                                <span style={{ width: '80px', textAlign: 'center' }}>
                                    {notice.profiles?.username || 'Admin'}
                                </span>
                                <span style={{ width: '80px', textAlign: 'center' }}>
                                    {new Date(notice.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                        등록된 공지사항이 없습니다.
                    </div>
                )}
            </div>
        </section>
    )
}
