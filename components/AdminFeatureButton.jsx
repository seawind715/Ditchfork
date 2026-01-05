'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminFeatureButton({ reviewId, userEmail }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Hide if not admin
    if (userEmail !== 'id01035206992@gmail.com') {
        return null
    }

    const handleSetHero = async () => {
        if (!confirm('이 리뷰를 메인 화면(Hero)에 등록하시겠습니까? 기존 내용은 대체됩니다.')) return

        setLoading(true)

        // 1. Deactivate all existing styling
        // For simplicity, we'll update the 'default' or single active row.
        // Or better, upsert a row where id='main_hero' or active=true.
        // Assuming we rely on the row where active=true.

        // Let's update the active hero row with this review_id
        const { error } = await supabase
            .from('hero_content')
            .update({
                review_id: reviewId,
                active: true,
                // We can optionally clear manual text fields so the review data takes precedence
                // headline: null, 
                // subheadline: null 
            })
            .eq('active', true)

        if (error) {
            alert('설정 실패: ' + error.message)
        } else {
            alert('메인 배너로 설정되었습니다!')
            router.push('/')
        }
        setLoading(false)
    }

    return (
        <button
            onClick={handleSetHero}
            disabled={loading}
            className="btn btn-outline"
            style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                fontSize: '0.9rem',
                marginLeft: '1rem',
                cursor: 'pointer'
            }}
        >
            {loading ? '설정 중...' : '★ 메인 Feature로 설정'}
        </button>
    )
}
