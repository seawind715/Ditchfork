'use client'

import Link from 'next/link'
import AdminDeleteButton from './AdminDeleteButton'

export default function FestivalCard({ festival, userEmail }) {
    const date = new Date(festival.start_date).toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    })

    // Calculate days left
    const now = new Date()
    const start = new Date(festival.start_date)
    const diffTime = start - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const dDay = diffDays === 0 ? 'D-Day' : `D-${diffDays}`

    return (
        <Link href={`/festivals/${festival.id}`} className="card" style={{ display: 'flex', textDecoration: 'none', height: '180px' }}>
            {/* Date Section (Left) */}
            <div style={{
                width: '100px',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>UPCOMING</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.2rem 0' }}>{dDay}</div>
            </div>

            {/* Info Section */}
            <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{date} @ {festival.location}</div>
                <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{festival.name}</h3>
                <div style={{ color: '#aaa', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    Lineup: {festival.lineup}
                </div>
            </div>

            {/* Action Section (Right) */}
            <div style={{
                width: '120px',
                borderLeft: '1px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>View Info</span>
                <span style={{ fontSize: '1.2rem' }}>→</span>
                <AdminDeleteButton table="festivals" id={festival.id} redirectTo="/festivals" userEmail={userEmail} />
            </div>
        </Link>
    )
}
