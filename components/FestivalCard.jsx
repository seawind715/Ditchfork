'use client'

import Link from 'next/link'
import AdminDeleteButton from './AdminDeleteButton'

export default function FestivalCard({ festival, userEmail }) {
    const start = new Date(festival.start_date)
    const end = festival.end_date ? new Date(festival.end_date) : null
    const now = new Date()

    // Format Date Range
    let dateStr = start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
    if (end) {
        // If same year, omit year. (Already omitted in default format usually, but checking month/day)
        const endDateStr = end.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
        dateStr = `${dateStr} ~ ${endDateStr}`
    }

    // D-Day Logic (Time-insensitive)
    let status = 'UPCOMING'
    let dDay = ''

    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(start)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(end || start) // Fallback to start if no end
    endDate.setHours(0, 0, 0, 0)

    // Check status based on timestamps (using original full times for detailed status if needed, 
    // but usually ONGOING means "within the date range")
    // Let's stick to user request: "Today" -> "D-Day".

    // Recalculate timestamps based on normalized dates
    const todayTs = today.getTime()
    const startTs = startDate.getTime()
    const endTs = endDate.getTime()

    if (todayTs > endTs) {
        status = 'ENDED'
        dDay = 'END'
    } else if (todayTs >= startTs && todayTs <= endTs) {
        status = 'ONGOING'
        dDay = 'NOW' // Or D-Day? usually ONGOING events show "NOW" or "Ing"
        // If it's the exact start day, maybe D-Day is better?
        // User asked for "D-Day". Let's see. 
        // Usually ONGOING implies it has started. 
        // If today is start day, it is technically D-Day.
        if (todayTs === startTs) dDay = 'D-Day'
        else dDay = 'NOW'
    } else {
        status = 'UPCOMING'
        const diffTime = startTs - todayTs
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        dDay = diffDays === 0 ? 'D-Day' : `D-${diffDays}`
    }

    const isSchool = festival.type?.startsWith('school_')
    const typeLabel = isSchool ? '교내' : '교외'

    return (
        <div className="card festival-card">
            {/* Main Clickable Area: Date + Info */}
            <Link
                href={`/festivals/${festival.id}`}
                className="festival-card-main-link"
                style={{ display: 'flex', flex: 1, textDecoration: 'none', color: 'inherit' }}
            >
                {/* Date Section (Left) */}
                <div className="festival-card-date" style={{
                    background: status === 'ONGOING' ? 'var(--accent)' : (status === 'ENDED' ? '#333' : 'var(--primary)')
                }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{status}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.2rem 0' }}>{dDay}</div>
                </div>

                {/* Info Section */}
                <div className="festival-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                            {dateStr} @ {festival.location}
                        </div>
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#aaa', border: '1px solid #444' }}>
                            {typeLabel}
                        </span>
                    </div>

                    <h3 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{festival.name}</h3>
                    <div style={{ color: '#aaa', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {isSchool ? (
                            <span style={{ color: 'var(--accent)' }}>View Event Details</span>
                        ) : (
                            `Lineup: ${festival.lineup || '공개 예정'}`
                        )}
                    </div>
                </div>
            </Link>

            {/* Action Section (Right) - Outside of Link */}
            <div className="festival-card-action">
                <Link href={`/festivals/${festival.id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>View Info</span>
                    <span style={{ fontSize: '1.2rem' }}>→</span>
                </Link>
                <AdminDeleteButton table="festivals" id={festival.id} redirectTo="/festivals" userEmail={userEmail} />
            </div>
        </div>
    )
}
