import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ParticipantForm from './ParticipantForm'
import AdminDeleteButton from '@/components/AdminDeleteButton'

export const revalidate = 0

export async function generateMetadata({ params }) {
    const { id } = await params
    try {
        const supabase = await createClient()
        if (!supabase) return { title: 'Ditchfork' }
        const { data: festival } = await supabase
            .from('festivals')
            .select('name')
            .eq('id', id)
            .maybeSingle()

        if (!festival) return { title: 'Festival Not Found | Ditchfork' }
        return { title: `${festival.name} | Festival | Ditchfork` }
    } catch (e) {
        return { title: 'Ditchfork' }
    }
}

export default async function FestivalDetailPage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    if (!supabase) {
        return <div className="container section"><h1>데이터베이스 연결 오류</h1></div>
    }

    try {
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        // 1. Fetch Festival Info
        const { data: festival, error } = await supabase
            .from('festivals')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (error || !festival) {
            notFound()
        }

        // 2. Fetch Participants
        const { count } = await supabase
            .from('festival_participants')
            .select('*', { count: 'exact', head: true })
            .eq('festival_id', id)

        const { data: participants } = await supabase
            .from('festival_participants')
            .select('*')
            .eq('festival_id', id)
            .order('created_at', { ascending: false })

        const date = new Date(festival.start_date).toLocaleDateString('ko-KR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'
        })

        return (
            <article>
                <section className="section" style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)', padding: '3rem 0' }}>
                    <div className="container">
                        <Link href="/festivals" className="btn btn-outline" style={{ marginBottom: '2rem' }}>← 목록으로</Link>
                        <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '1rem' }}>{festival.name}</h1>
                        <div style={{ fontSize: '1.5rem', color: '#888', marginBottom: '2rem' }}>
                            {date} <br />
                            @ {festival.location}
                        </div>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            {festival.ticket_url && (
                                <a href={festival.ticket_url} target="_blank" className="btn" style={{ padding: '1rem 2rem' }}>
                                    티켓 예매하러 가기 ({festival.ticket_price || '가격 정보 없음'})
                                </a>
                            )}
                            <AdminDeleteButton table="festivals" id={id} redirectTo="/festivals" userEmail={user?.email} />
                        </div>
                    </div>
                </section>

                <section className="container section grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
                    <div>
                        <h3>라인업</h3>
                        <div style={{ fontSize: '1.2rem', lineHeight: 1.8, marginBottom: '3rem', whiteSpace: 'pre-wrap' }}>
                            {festival.lineup || '라인업 정보가 없습니다.'}
                        </div>
                        <h3>상세 내용</h3>
                        <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#ccc', whiteSpace: 'pre-wrap' }}>
                            {festival.description}
                        </div>
                    </div>
                    <div>
                        <div style={{ background: '#151515', padding: '1.5rem', border: '1px solid var(--border)' }}>
                            <h3 style={{ marginBottom: '0.5rem' }}>동행 찾기</h3>
                            <p style={{ color: '#888', marginBottom: '1.5rem' }}>
                                현재 <strong style={{ color: 'var(--primary)' }}>{count || 0}명</strong>이 함께할 친구를 찾고 있어요.
                            </p>
                            <ParticipantForm festivalId={id} />
                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                {participants?.map(p => (
                                    <div key={p.id} style={{ padding: '0.8rem', background: '#222', borderBottom: '1px solid #333' }}>
                                        <div style={{ fontWeight: 700 }}>{p.name} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#666' }}>({p.student_id})</span></div>
                                        {p.message && <div style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '0.3rem' }}>{p.message}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </article>
        )
    } catch (e) {
        console.error("Festival detail error:", e)
        return <div className="container section"><h1>정보를 가져오는 중 오류가 발생했습니다.</h1></div>
    }
}
