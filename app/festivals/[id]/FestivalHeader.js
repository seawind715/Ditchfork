'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import AdminDeleteButton from '@/components/AdminDeleteButton'
import { uploadImage } from '@/utils/imageUpload'

export default function FestivalHeader({ festival, user }) {
    const router = useRouter()
    const supabase = createClient()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    // Split initialization logic
    const splitDateTime = (isoString) => {
        if (!isoString) return { date: '', time: '' }
        const d = new Date(isoString)
        if (isNaN(d.getTime())) return { date: '', time: '' }

        // Use local parts manually
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')

        return {
            date: `${year}-${month}-${day}`,
            time: `${hours}:${minutes}`
        }
    }

    const startSplit = splitDateTime(festival.start_date)
    const endSplit = splitDateTime(festival.end_date)

    const [formData, setFormData] = useState({
        name: festival.name,
        type: festival.type, // Track type
        // Separate fields for inputs
        start_date_d: startSplit.date,
        start_date_t: startSplit.time,
        end_date_d: endSplit.date,
        end_date_t: endSplit.time,

        location: festival.location,
        image_url: festival.image_url || '',
        ticket_url: festival.ticket_url || '',
        ticket_price: festival.ticket_price || '',
        description: festival.description || '',
        lineup: festival.lineup || '',
        related_link: festival.related_link || ''
    })

    // Init Logic for Scope/Category
    const initType = festival.type || 'external_festival'
    const [scope, setScope] = useState(initType.startsWith('school_') ? 'school' : 'external')
    const [category, setCategory] = useState(() => {
        if (initType.endsWith('_musical')) return 'musical'
        if (initType.endsWith('_exhibition')) return 'exhibition'
        return 'festival'
    })

    // Update formData.type whenever scope/category changes
    const currentType = `${scope}_${category}`
    if (formData.type !== currentType) {
        setFormData(prev => ({ ...prev, type: currentType }))
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Check required
        if (!formData.start_date_d || !formData.start_date_t) {
            alert('시작 날짜와 시간을 모두 입력해주세요.')
            setIsLoading(false)
            return
        }

        // Combine to ISO UTC with explicit setters for safety
        const combineToISO = (datePart, timePart) => {
            if (!datePart || !timePart) return null
            // datePart is "YYYY-MM-DD"
            const [y, m, d] = datePart.split('-').map(Number)
            // timePart is "HH:mm"
            const [h, min] = timePart.split(':').map(Number)

            // Create Local Date
            const localDate = new Date(y, m - 1, d, h, min, 0)
            if (isNaN(localDate.getTime())) return null

            return localDate.toISOString()
        }

        const updateData = {
            name: formData.name,
            location: formData.location,
            image_url: formData.image_url,
            ticket_url: formData.ticket_url,
            ticket_price: formData.ticket_price,
            description: formData.description,
            lineup: formData.lineup,
            related_link: formData.related_link,
            type: `${scope}_${category}`, // Include type update
            start_date: combineToISO(formData.start_date_d, formData.start_date_t),
            end_date: combineToISO(formData.end_date_d, formData.end_date_t)
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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!confirm('이미지를 업로드하시겠습니까? (자동으로 압축되어 저장됩니다)')) return

        setIsLoading(true)
        try {
            const publicUrl = await uploadImage(file, 'images')
            setFormData({ ...formData, image_url: publicUrl })
            alert('이미지 업로드 완료!')
        } catch (error) {
            alert('이미지 업로드 실패: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="container" style={{ padding: '2rem 0' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', background: '#222', padding: '2rem', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Edit Festival Info</h3>

                    <div style={{ padding: '1rem', background: '#333', borderRadius: '8px', marginBottom: '1rem' }}>
                        <label style={{ display: 'block', color: 'var(--primary)', marginBottom: '0.8rem', fontWeight: 'bold' }}>이벤트 유형 변경</label>

                        {/* Scope */}
                        <div style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#ccc', marginRight: '1rem', fontSize: '0.9rem' }}>행사 범위:</span>
                            <div style={{ display: 'inline-flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="scope"
                                        value="external"
                                        checked={scope === 'external'}
                                        onChange={(e) => setScope(e.target.value)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ color: scope === 'external' ? 'white' : '#888' }}>교외 (External)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="scope"
                                        value="school"
                                        checked={scope === 'school'}
                                        onChange={(e) => setScope(e.target.value)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ color: scope === 'school' ? 'white' : '#888' }}>교내 (School)</span>
                                </label>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <span style={{ color: '#ccc', marginRight: '1rem', fontSize: '0.9rem' }}>카테고리:</span>
                            <div style={{ display: 'inline-flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="festival"
                                        checked={category === 'festival'}
                                        onChange={(e) => setCategory(e.target.value)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ color: category === 'festival' ? 'white' : '#888' }}>축제 (Festival)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="musical"
                                        checked={category === 'musical'}
                                        onChange={(e) => setCategory(e.target.value)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ color: category === 'musical' ? 'white' : '#888' }}>뮤지컬 (Musical)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="exhibition"
                                        checked={category === 'exhibition'}
                                        onChange={(e) => setCategory(e.target.value)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ color: category === 'exhibition' ? 'white' : '#888' }}>전시 (Exhibition)</span>
                                </label>
                            </div>
                        </div>
                    </div>

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
                            <label style={{ display: 'block', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>📅 시작 날짜 & 시간</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    name="start_date_d"
                                    value={formData.start_date_d}
                                    onChange={handleChange}
                                    required
                                    style={{ flex: 3, cursor: 'pointer' }}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                />
                                <input type="time" name="start_date_t" value={formData.start_date_t} onChange={handleChange} required style={{ flex: 2, cursor: 'pointer' }} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>종료 날짜 & 시간 (선택)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="date"
                                    name="end_date_d"
                                    value={formData.end_date_d}
                                    onChange={handleChange}
                                    style={{ flex: 3, cursor: 'pointer' }}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                />
                                <input type="time" name="end_date_t" value={formData.end_date_t} onChange={handleChange} style={{ flex: 2, cursor: 'pointer' }} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>메인 이미지</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {formData.image_url && <img src={formData.image_url} alt="Preview" style={{ height: '80px', borderRadius: '4px', border: '1px solid #444' }} />}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{
                                    background: '#333',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    color: '#ccc',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                        <input name="image_url" type="hidden" value={formData.image_url} />
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>* 이미지는 자동으로 압축(최적화)되어 업로드됩니다.</p>
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
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>참고 링크 (공식 사이트/SNS)</label>
                        <input name="related_link" value={formData.related_link} onChange={handleChange} placeholder="https://..." />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#888', marginBottom: '0.5rem' }}>상세 설명</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={5} />
                    </div>

                    {!currentType.startsWith('school_') && (
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
                    {festival.related_link && (
                        <a href={festival.related_link} target="_blank" className="btn btn-outline" style={{ padding: '0.8rem 1.5rem' }}>
                            🔗 공식 사이트/SNS
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
