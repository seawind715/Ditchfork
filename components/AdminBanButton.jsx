'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminBanButton({ userId, initialIsBanned }) {
    const [isBanned, setIsBanned] = useState(initialIsBanned)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const toggleBan = async () => {
        const confirmMsg = isBanned
            ? '이 유저의 차단을 해제하시겠습니까?'
            : '이 유저를 차단하시겠습니까? 차단 시 사이트 이용이 즉시 제한됩니다.'

        if (!confirm(confirmMsg)) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    is_banned: !isBanned,
                    banned_at: !isBanned ? new Date().toISOString() : null
                })
                .eq('id', userId)

            if (error) throw error

            setIsBanned(!isBanned)
            alert(isBanned ? '차단이 해제되었습니다.' : '유저가 차단되었습니다.')
            router.refresh()
        } catch (err) {
            console.error('Ban toggle error:', err)
            alert('작업 중 오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={toggleBan}
            disabled={loading}
            className="btn"
            style={{
                marginTop: '2rem',
                background: isBanned ? '#333' : '#ff0000',
                color: 'white',
                border: 'none',
                width: '100%',
                padding: '1rem',
                fontSize: '1rem'
            }}
        >
            {loading ? '처리 중...' : isBanned ? '🔓 차단 해제' : '🚫 유저 차단하기'}
        </button>
    )
}
