'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewFestivalPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Helper arrays for options
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    const minutes = ['00', '10', '20', '30', '40', '50']

    // Type state
    const [type, setType] = useState('external')
    const isSchool = type === 'school'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target)

        // Combine Date and Time inputs
        const startDay = formData.get('start_day')
        // Start time is now used for both school and external
        const startHour = formData.get('start_hour')
        const startMinute = formData.get('start_minute')
        const startDateISO = `${startDay}T${startHour}:${startMinute}:00`

        // End Date
        const endDay = formData.get('end_day')
        let endDateISO = null
        if (endDay) {
            // Default end time to 23:59:59 if only day provided
            endDateISO = `${endDay}T23:59:59`
        }

        const festival = {
            name: formData.get('name'),
            location: formData.get('location'),
            start_date: startDateISO,
            end_date: endDateISO, // Add end_date
            type: type, // Add type
            // Conditional fields based on type
            lineup: isSchool ? null : formData.get('lineup'),
            description: isSchool ? null : formData.get('description'),
            ticket_price: isSchool ? null : formData.get('ticket_price'),
            ticket_url: isSchool ? null : formData.get('ticket_url')
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('로그인이 필요합니다.')
            router.push('/login')
            return
        }

        const { error } = await supabase
            .from('festivals')
            .insert(festival)

        if (error) {
            console.error(error)
            alert('저장 실패: ' + error.message)
        } else {
            alert('페스티벌이 등록되었습니다!')
            router.push('/festivals')
        }
        setLoading(false)
    }

    return (
        <div className="section container" style={{ maxWidth: '800px' }}>
            <h1>새 이벤트 등록 (New Event)</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Type Selection */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>이벤트 유형</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: !isSchool ? 'var(--primary)' : 'var(--secondary)', padding: '0.5rem 1rem', borderRadius: '4px', transition: 'background 0.2s' }}>
                            <input
                                type="radio"
                                name="type"
                                value="external"
                                checked={type === 'external'}
                                onChange={(e) => setType(e.target.value)}
                                style={{ width: 'auto', margin: 0 }}
                            />
                            교외 (External)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: isSchool ? 'var(--primary)' : 'var(--secondary)', padding: '0.5rem 1rem', borderRadius: '4px', transition: 'background 0.2s' }}>
                            <input
                                type="radio"
                                name="type"
                                value="school"
                                checked={type === 'school'}
                                onChange={(e) => setType(e.target.value)}
                                style={{ width: 'auto', margin: 0 }}
                            />
                            교내 (School)
                        </label>
                    </div>
                </div>

                <div>
                    <label>이벤트 이름</label>
                    <input name="name" required placeholder={isSchool ? "예: 음악과 그림이 있는 풍경" : "예: Incheon Pentaport Rock Festival 2026"} />
                </div>

                <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                        <label>개최 장소</label>
                        {isSchool ? (
                            <div style={{ padding: '0.8rem', background: '#222', color: '#aaa', borderRadius: '4px', border: '1px solid #333' }}>
                                동탄국제고등학교
                                <input type="hidden" name="location" value="동탄국제고등학교" />
                            </div>
                        ) : (
                            <input name="location" required placeholder="예: 송도달빛축제공원" />
                        )}
                    </div>
                    <div>
                        <label>시작 날짜</label>
                        <input
                            name="start_day"
                            type="date"
                            required
                            style={{ marginBottom: '0.5rem', cursor: 'pointer' }}
                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        />
                        {/* Start Time is now available for BOTH types */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: '#888', margin: 0 }}>시작 시간:</label>
                            <select name="start_hour" required style={{ marginBottom: 0, padding: '0.3rem', width: 'auto' }}>
                                {hours.map(h => <option key={h} value={h}>{h}시</option>)}
                            </select>
                            <select name="start_minute" required style={{ marginBottom: 0, padding: '0.3rem', width: 'auto' }}>
                                {minutes.map(m => <option key={m} value={m}>{m}분</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                        <label>종료 날짜 (선택)</label>
                        <input
                            name="end_day"
                            type="date"
                            style={{ marginBottom: '0.5rem', cursor: 'pointer' }}
                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>
                            당일 행사라면 비워두세요.
                        </p>
                    </div>
                </div>

                {!isSchool && (
                    <>
                        <div>
                            <label>출연 아티스트 (라인업)</label>
                            <textarea name="lineup" rows={3} placeholder="주요 라인업을 콤마(,)로 구분해서 적어주세요." style={{ width: '100%', padding: '1rem', background: 'var(--input)', border: '1px solid var(--border)', color: 'white' }}></textarea>
                        </div>

                        <div>
                            <label>이벤트 상세 내용</label>
                            <textarea name="description" rows={6} placeholder="어떤 이벤트인가요?" style={{ width: '100%', padding: '1rem', background: 'var(--input)', border: '1px solid var(--border)', color: 'white' }}></textarea>
                        </div>

                        <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <label>티켓 비용</label>
                                <input name="ticket_price" placeholder="예: 3일권 240,000원" />
                            </div>
                            <div>
                                <label>예매 링크 (URL)</label>
                                <input name="ticket_url" type="url" placeholder="https://..." />
                            </div>
                        </div>
                    </>
                )}

                <button type="submit" className="btn" disabled={loading} style={{ padding: '1rem', fontSize: '1.2rem' }}>
                    {loading ? '등록 중...' : '이벤트 등록하기'}
                </button>
            </form>
        </div>
    )
}
