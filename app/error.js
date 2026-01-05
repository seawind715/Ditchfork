'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="container section" style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--primary)' }}>Application Error</h1>
            <p style={{ marginBottom: '2rem' }}>서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
            <div style={{
                background: '#111',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                marginBottom: '2rem',
                textAlign: 'left',
                fontSize: '0.9rem',
                color: '#888',
                whiteSpace: 'pre-wrap'
            }}>
                {error?.message || '알 수 없는 오류'}
            </div>
            <button
                className="btn"
                onClick={() => reset()}
            >
                다시 시도하기
            </button>
        </div>
    )
}
