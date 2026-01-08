'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PerformanceForm({ festivalId }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedGenres, setSelectedGenres] = useState(['Band']) // Default
    const supabase = createClient()

    const genres = [
        { value: 'Band', label: '밴드' },
        { value: 'Rap', label: '랩/힙합' },
        { value: 'Dance', label: '댄스' },
        { value: 'Song', label: '보컬' },
        { value: 'Gag', label: '개그' },
        { value: 'DJ', label: 'DJ' },
        { value: 'Other', label: '기타' }
    ]

    const toggleGenre = (value) => {
        if (selectedGenres.includes(value)) {
            // Prevent removing the last one if you want at least one? Or allow empty?
            // User probably wants at least one. Let's allow empty for now or enforce 1.
            // Enforcing at least one is better UX usually, but let's allow flexibility.
            if (selectedGenres.length === 1) return // Keep at least one
            setSelectedGenres(selectedGenres.filter(g => g !== value))
        } else {
            setSelectedGenres([...selectedGenres, value])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const form = e.target
        const data = {
            festival_id: festivalId,
            artist: form.artist.value,
            content: form.content.value,
            genre: selectedGenres.join(', '), // Comma separated string
            section: form.section.value || '1부',
            is_secret: form.is_secret.checked
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('로그인이 필요합니다.')
            setLoading(false)
            return
        }

        data.user_id = user.id

        // Calculate next order
        const { data: maxOrderData } = await supabase
            .from('festival_performances')
            .select('order_index')
            .eq('festival_id', festivalId)
            .order('order_index', { ascending: false })
            .limit(1)

        const nextOrder = (maxOrderData && maxOrderData.length > 0) ? maxOrderData[0].order_index + 1 : 1
        data.order_index = nextOrder

        const { error } = await supabase
            .from('festival_performances')
            .insert(data)

        if (error) {
            alert('등록 실패: ' + error.message)
        } else {
            form.reset()
            // Reset genres to default
            setSelectedGenres(['Band'])
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div style={{ background: '#222', padding: '1.5rem', borderRadius: '4px', border: '1px solid #333' }}>
            <h3 style={{ marginBottom: '1rem' }}>Add Performance</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>장르 (다중 선택 가능)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {genres.map(g => (
                                <button
                                    key={g.value}
                                    type="button"
                                    onClick={() => toggleGenre(g.value)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '20px',
                                        border: selectedGenres.includes(g.value) ? '1px solid var(--primary)' : '1px solid #444',
                                        background: selectedGenres.includes(g.value) ? 'var(--primary)' : 'transparent',
                                        color: selectedGenres.includes(g.value) ? 'white' : '#aaa',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>공연 부 (Section) (선택)</label>
                    <input name="section" placeholder="예: 1부, 2부, 오프닝..." list="section-options" style={{ width: '100%', padding: '0.5rem' }} />
                    <datalist id="section-options">
                        <option value="1부" />
                        <option value="2부" />
                        <option value="3부" />
                        <option value="오프닝" />
                        <option value="피날레" />
                    </datalist>
                </div>

                <div>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>출연자 / 팀명 (Artist)</label>
                    <input name="artist" required placeholder="예: CLOUD9" style={{ width: '100%', padding: '0.5rem', fontWeight: 'bold' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <input type="checkbox" name="is_secret" id="is_secret" style={{ width: 'auto', marginBottom: 0 }} />
                    <label htmlFor="is_secret" style={{ cursor: 'pointer', selectNone: 'none' }}>비밀(Secret) 공연으로 설정하기</label>
                </div>

                <div>
                    <textarea name="content" rows={3} placeholder="공연 내용을 입력해주세요. (곡 목록, 멤버 소개 등)" style={{ width: '100%', padding: '0.5rem' }} />
                </div>

                <button type="submit" disabled={loading} className="btn" style={{ width: '100%' }}>
                    {loading ? '등록 중...' : '공연 정보 추가'}
                </button>
            </form>
        </div>
    )
}
