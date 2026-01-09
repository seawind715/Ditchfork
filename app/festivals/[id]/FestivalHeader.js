'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import AdminDeleteButton from '@/components/AdminDeleteButton'

export default function FestivalHeader({ festival, user }) {
    const router = useRouter()
    const supabase = createClient()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: festival.name,
        start_date: festival.start_date ? new Date(festival.start_date).toISOString().slice(0, 16) : '',
        end_date: festival.end_date ? new Date(festival.end_date).toISOString().slice(0, 16) : '',
        location: festival.location,
        image_url: festival.image_url || '',
        ticket_url: festival.ticket_url || '',
        ticket_price: festival.ticket_price || '',
        description: festival.description || '',
        lineup: festival.lineup || '' // For non-school type mainly
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Convert empty strings to null for dates/urls if needed? 
        // Supabase handles date parsing, but empty string might error.
        const updateData = {
            ...formData,
            end_date: formData.end_date || null
        }

        const { error } = await supabase
            .from('festivals')
            .update(updateData)
            .eq('id', festival.id)

        if (error) {
            alert('수정 실패: ' + error.message)
        } else {
            setIsEditing(false)
            router.refresh()
        }
        setIsLoading(false)
    }

    // Date Format Logic for Display
    const start = new Date(festival.start_date)
    const end = festival.end_date ? new Date(festival.end_date) : null

    let dateStr = start.toLocaleDateString('ko-KR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric'
    })

    if (end) {
        const endDateStr = end.toLocaleDateString('ko-KR', {
            month: 'long', day: 'numeric', weekday: 'long'
        })
        dateStr = `${dateStr} ~ ${endDateStr}`
    }

    if (isEditing) {
        return (
            <div className="container" style={{ padding: '2rem 0' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', background: '#222', padding: '2rem', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Edit Festival Info</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>행사명</label>
                            <input name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>장소</label>
                            <input name="location" value={formData.location} onChange={handleChange} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>시작 일시</label>
                            <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>종료 날짜 (선택)</label>
                            <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>메인 이미지 URL</label>
                        <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
                        {formData.image_url && <img src={formData.image_url} alt="Preview" style={{ height: '100px', marginTop: '0.5rem', borderRadius: '4px' }} />}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>티켓 예매 링크</label>
                            <input name="ticket_url" value={formData.ticket_url} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>티켓 가격 정보</label>
                            <input name="ticket_price" value={formData.ticket_price} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>상세 설명</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={5} />
                    </div>

                    {festival.type !== 'school' && (
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>라인업 (텍스트)</label>
                            <textarea name="lineup" value={formData.lineup} onChange={handleChange} rows={3} />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn" disabled={isLoading}>{isLoading ? '저장 중...' : '저장하기'}</button>
                        <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>취소</button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap-reverse' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    {/* Back Link Moved Here or kept in parent? Parent has it. */}
                </div>
                <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '1rem', wordBreak: 'keep-all' }}>{festival.name}</h1>
                <div style={{ fontSize: '1.5rem', color: '#888', marginBottom: '2rem' }}>
                    {dateStr} <br />
                    @ {festival.location}
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {festival.ticket_url && (
                        <a href={festival.ticket_url} target="_blank" className="btn" style={{ padding: '1rem 2rem' }}>
                            티켓 예매하러 가기 ({festival.ticket_price || '가격 정보 없음'})
                        </a>
                    )}
                    {user && (
                        <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                            ✏️ 정보 수정
                        </button>
                    )}
                    <AdminDeleteButton table="festivals" id={festival.id} redirectTo="/festivals" userEmail={user?.email} />
                </div>
            </div>

            {/* Main Image Setup */}
            {festival.image_url ? (
                <div style={{ width: '300px', height: '300px', flexShrink: 0 }}>
                    <img
                        src={festival.image_url}
                        alt={festival.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '1px solid #333' }}
                    />
                </div>
            ) : (
                <div style={{ width: '300px', height: '300px', background: '#222', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #444' }}>
                    <span style={{ color: '#555' }}>No Image</span>
                </div>
            )}
        </div>
    )
}
