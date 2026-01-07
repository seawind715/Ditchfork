'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PinButton({ noticeId, isPinned }) {
    const [pinned, setPinned] = useState(isPinned)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleTogglePin = async (e) => {
        e.preventDefault() // prevent link click if inside link
        e.stopPropagation()

        if (loading) return

        setLoading(true)

        try {
            if (!pinned) {
                // Check if already 3 pins
                const { count, error: countError } = await supabase
                    .from('notices')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_pinned', true)

                if (countError) throw countError

                if (count >= 3) {
                    alert('최대 3개까지만 고정할 수 있습니다.')
                    setLoading(false)
                    return
                }
            }

            const { error } = await supabase
                .from('notices')
                .update({ is_pinned: !pinned })
                .eq('id', noticeId)

            if (error) {
                console.error(error)
                alert('변경 실패')
            } else {
                setPinned(!pinned)
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            alert('오류 발생')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleTogglePin}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.2rem',
                color: pinned ? '#fff' : '#666',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s'
            }}
            title={pinned ? "고정 해제" : "상단 고정"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="17" x2="12" y2="22"></line>
                <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
            </svg>
        </button>
    )
}
