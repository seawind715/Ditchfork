'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ParticipantForm({ festivalId }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const form = e.target
        const data = {
            festival_id: festivalId,
            student_id: form.student_id.value,
            name: form.name.value,
            message: form.message.value
        }

        const { error } = await supabase
            .from('festival_participants')
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <input name="student_id" required placeholder="학번 (예: 20261234)" style={{ marginBottom: 0, padding: '0.6rem' }} />
            <input name="name" required placeholder="이름 (예: 홍길동)" style={{ marginBottom: 0, padding: '0.6rem' }} />
            <textarea name="message" rows={2} placeholder="한마디 (선택)" style={{ marginBottom: 0, padding: '0.6rem', fontSize: '0.9rem' }}></textarea>
            <button type="submit" className="btn" disabled={loading} style={{ width: '100%', fontSize: '0.9rem' }}>
                {loading ? '등록 중...' : '참여 희망 등록'}
            </button>
        </form>
    )
}
