'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminWipeButton({ userEmail }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    if (userEmail?.toLowerCase().trim() !== 'id01035206992@gmail.com') {
        return null
    }

    const handleWipe = async () => {
        const confirm1 = confirm('🚨 경고: 모든 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
        if (!confirm1) return

        const confirm2 = confirm('정말로 "모든" 리뷰를 삭제하시겠습니까?')
        if (!confirm2) return

        setLoading(true)
        // Using a filter that matches everything (id is not null)
        const { error } = await supabase
            .from('reviews')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (error) {
            alert('초기화 실패: ' + error.message)
            setLoading(false)
        } else {
            alert('모든 리뷰가 삭제되었습니다.')
            router.refresh()
        }
    }

    return (
        <div style={{ padding: '2rem', border: '1px solid #f00', background: 'rgba(255,0,0,0.05)', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
            <h3 style={{ color: '#f00', marginBottom: '1rem' }}>Admin Management: Data Reset</h3>
            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.5rem' }}>
                기존의 모든 리뷰 데이터를 삭제하고 사이트를 초기화할 수 있습니다.
            </p>
            <button
                onClick={handleWipe}
                disabled={loading}
                className="btn"
                style={{ background: 'red', fontSize: '0.9rem', padding: '0.8rem 2rem' }}
            >
                {loading ? '삭제 중...' : '모든 리뷰 삭제하기 (WIPE)'}
            </button>
        </div>
    )
}
