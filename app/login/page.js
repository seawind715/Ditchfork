'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        const supabase = createClient()
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    return (
        <div className="section container" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h1>로그인</h1>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                Ditchfork에 오신 것을 환영합니다.<br />
                앨범 리뷰를 작성하고 페스티벌 친구를 찾아보세요.
            </p>

            <button
                className="btn"
                onClick={handleLogin}
                disabled={loading}
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            >
                {loading ? '연결 중...' : 'Google로 계속하기'}
            </button>

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f9f9f9', border: '1px solid #ddd', fontSize: '0.9rem', wordBreak: 'keep-all' }}>
                <strong>개발 모드 참고사항:</strong><br />
                로그인 실패 시 Supabase 설정에서 Authentication &gt; Providers &gt; Google이 활성화되어 있는지 확인해주세요.
            </div>
        </div>
    )
}
