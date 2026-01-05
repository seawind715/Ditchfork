'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminDeleteButton({ table, id, redirectTo, userEmail }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Hide completely if not admin
    if (userEmail !== 'id01035206992@gmail.com') {
        return null
    }

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return

        setLoading(true)
        const { error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)

        if (error) {
            alert('삭제 실패: ' + error.message)
            setLoading(false)
        } else {
            alert('삭제되었습니다.')
            router.replace(redirectTo)
            router.refresh()
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            style={{
                background: 'red',
                color: 'white',
                border: 'none',
                padding: '0.5rem',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '0.5rem'
            }}
            title="관리자 권한으로 삭제"
        >
            {loading ? '...' : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            )}
        </button>
    )
}
