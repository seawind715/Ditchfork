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
            order_index: parseInt(form.order_index.value),
            name: form.name.value,
            artist: form.artist.value,
            content: form.content.value,
            genre: form.genre.value
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('로그인이 필요합니다.')
            setLoading(false)
            return
        }

        data.user_id = user.id

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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.9rem', color: '#888' }}>순서</label>
                        <input name="order_index" type="number" required placeholder="1" style={{ width: '100%', padding: '0.5rem' }} />
                    </div>
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
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>공연명</label>
                    <input name="name" required placeholder="예: 오프닝 공연" style={{ width: '100%', padding: '0.5rem' }} />
                </div>

                <div>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>출연자 (팀명)</label>
                    <input name="artist" required placeholder="예: 밴드부" style={{ width: '100%', padding: '0.5rem' }} />
                </div>

                <div>
                    <label style={{ fontSize: '0.9rem', color: '#888' }}>공연 내용 (곡명 등)</label>
                    <textarea name="content" rows={2} placeholder="예: 1. 데이식스 - 한 페이지가 될 수 있게" style={{ width: '100%', padding: '0.5rem' }}></textarea>
                </div>

                <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Adding...' : 'Add Performance'}
                </button>
            </form>
        </div>
    )
}
