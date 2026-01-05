'use client'

export default function ScoreGuide() {
    const scores = [
        { val: 10, label: "시대를 초월한 명반" },
        { val: 9, label: "장르를 대표하는 명반" },
        { val: 8, label: "매우 뛰어난 앨범" },
        { val: 7, label: "좋은 앨범" },
        { val: 6, label: "들을 만한 가치 있는 앨범" },
        { val: 5, label: "나쁘지도 인상적이지도 않은 앨범" },
        { val: 4, label: "좋지 않은 앨범" },
        { val: 3, label: "감상이 힘든 앨범" },
        { val: 2, label: "총체적 난국인 앨범" },
        { val: 1, label: "가치를 찾기 힘든 앨범" },
        { val: 0, label: "음악으로 볼 수 없는 앨범" }
    ]

    return (
        <section className="section" style={{ background: '#050505', borderTop: '1px solid #111', borderBottom: '1px solid #111', padding: '4rem 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>
                        Ditchfork Scoring Guide
                    </span>
                    <h2 style={{ marginTop: '0.5rem' }}>평가 기준 안내</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '800px', margin: '0 auto' }}>
                    {scores.map((s, idx) => (
                        <div key={s.val} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2rem',
                            padding: '1rem 1.5rem',
                            background: idx === 0 ? 'rgba(255,0,0,0.05)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${idx === 0 ? 'var(--primary)' : '#222'}`,
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{
                                fontSize: '1.8rem',
                                fontWeight: 900,
                                color: s.val >= 8 ? 'var(--primary)' : s.val >= 6 ? '#fff' : '#666',
                                width: '40px',
                                textAlign: 'center'
                            }}>
                                {s.val}
                            </div>
                            <div style={{
                                fontSize: '1rem',
                                color: s.val >= 8 ? '#fff' : '#ccc',
                                fontWeight: s.val >= 8 ? 700 : 400
                            }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center', color: '#555', fontSize: '0.85rem' }}>
                    * 모든 평점은 주관적이며, Ditchfork 비평가들의 심도 있는 청취를 바탕으로 정해집니다.
                </div>
            </div>
        </section>
    )
}
