'use client'

import Link from 'next/link'

export default function NoticeSection({ notices }) {
    if (!notices || notices.length === 0) return null

    return (
        <section className="container section" style={{ marginTop: '-2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>📢 공지사항</h3>
                <Link href="/notices" style={{ fontSize: '0.9rem', color: '#888', textDecoration: 'none' }}>
                    더보기 +
                </Link>
            </div>
            <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}>
                {notices.map((notice, index) => (
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
                        <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '1rem' }}>
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
                ))}
            </div>
        </section>
    )
}
