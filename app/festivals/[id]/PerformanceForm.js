'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PerformanceForm({ festivalId }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const form = e.target
        const data = {
            festival_id: festivalId,
            // order_index: Will be calculated in SQL or fetched before insert.
            // Let's fetch the current max order first.
            name: form.name.value,
            artist: form.artist.value,
            content: form.content.value,
            genre: form.genre.value,
            section: form.section.value || '1부' // Default to 1부
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
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div style={{ background: '#222', padding: '1.5rem', borderRadius: '4px', border: '1px solid #333' }}>
            <h3 style={{ marginBottom: '1rem' }}>Add Performance</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    {/* Order input removed for Drag and Drop */}
                    <div>
                        <label style={{ fontSize: '0.9rem', color: '#888' }}>장르</label>
                        <select name="genre" required style={{ width: '100%', padding: '0.5rem' }}>
                            <option value="Band">밴드 (Band)</option>
                            <option value="Rap">랩/힙합 (Rap)</option>
                            <option value="Dance">댄스 (Dance)</option>
                            <option value="Song">보컬/노래 (Song)</option>
                            <option value="Gag">개그/예능 (Gag)</option>
                            <option value="Other">기타 (Other)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>공연 부 (Section) (선택)</label>
                    <input name="section" placeholder="예: 1부, 2부, 오프닝..." defaultValue="1부" list="section-options" style={{ width: '100%', padding: '0.5rem' }} />
                    <datalist id="section-options">
                        <option value="1부" />
                        <option value="2부" />
                        <option value="3부" />
                        <option value="오프닝" />
                        <option value="피날레" />
                    </datalist>
                </div>

                <div>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>공연명 (선택)</label>
                    <input name="name" placeholder="예: 오프닝 공연" style={{ width: '100%', padding: '0.5rem' }} />
                </div>

                <div>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>출연자 (팀명)</label>
                    <input name="artist" required placeholder="예: CLOUD9" style={{ width: '100%', padding: '0.5rem' }} />
                </div>

                <div>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>공연 내용 (곡명 등)</label>
                    <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>비워두면 "Secret!"으로 표시됩니다.</p>
                    <textarea name="content" rows={2} placeholder="예: 1. 데이식스 - 한 페이지가 될 수 있게" style={{ width: '100%', padding: '0.5rem' }}></textarea>
                </div>

                <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Adding...' : 'Add Performance'}
                </button>
            </form>
        </div>
    )
}
