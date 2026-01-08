import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ParticipantForm from './ParticipantForm'
import PerformanceForm from './PerformanceForm'
import PerformanceList from './PerformanceList'
import AdminDeleteButton from '@/components/AdminDeleteButton'
import FestivalReviewSection from '@/components/FestivalReviewSection' // New component

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

        if (!festival) return { title: 'Event Not Found | Ditchfork' }
        return { title: `${festival.name} | Event | Ditchfork` }
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

        // 3. (School Only) Fetch Performances
        let performances = null
        if (festival.type === 'school') {
            const { data: perfs } = await supabase
                .from('festival_performances')
                .select('*')
                .eq('festival_id', id)
                .order('order_index', { ascending: true })
            performances = perfs
        }

        // 4. Date Logic
        const start = new Date(festival.start_date)
        const end = festival.end_date ? new Date(festival.end_date) : null

        let dateStr = start.toLocaleDateString('ko-KR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: 'numeric' // Show time logic: if end date exists, maybe simpler format?
            // Actually, for consistency, let's keep detailed start time.
        })

        if (end) {
            const endDateStr = end.toLocaleDateString('ko-KR', {
                month: 'long', day: 'numeric', weekday: 'long'
            })
            // If simple string needed:
            dateStr = `${dateStr} ~ ${endDateStr}`
        }

        // Check if ended
        const now = new Date()
        const isEnded = end ? (new Date(end) < now) : (new Date(start.getTime() + 24 * 60 * 60 * 1000) < now) // Roughly check end of start day if no end date

        return (
            <article>
                <section className="section" style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)', padding: '3rem 0' }}>
                    <div className="container">
                        <Link href="/festivals" className="btn btn-outline" style={{ marginBottom: '2rem' }}>← 목록으로</Link>
                        <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '1rem' }}>{festival.name}</h1>
                        <div style={{ fontSize: '1.5rem', color: '#888', marginBottom: '2rem' }}>
                            {dateStr} <br />
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
                        {/* Content Section */}
                        {festival.type === 'school' ? (
                            <>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Timetable / Lineup</span>
                                    <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 400 }}>누구나 공연 정보를 추가하고 자유롭게 수정할 수 있어요!</span>
                                </h3>

                                <PerformanceList initialPerformances={performances || []} festivalId={id} user={user} />

                                {/* Add Performance Form - Always visible for school events, even if ended, for history/record? 
                                    Or hide if ended? User said "행사가 끝난 이후 ... 행사에 후기를 달 수 있게 만들어줘". 
                                    Doesn't explicitly say disable editing. Let's keep it open for now or maybe user wants it locked?
                                    User didn't specify locking.
                                */}
                                {user ? (
                                    <div style={{ marginTop: '2rem' }}>
                                        <PerformanceForm festivalId={id} />
                                    </div>
                                ) : (
                                    <div style={{ padding: '1rem', background: '#222', textAlign: 'center', marginTop: '2rem' }}>
                                        공연 정보를 추가하려면 <Link href="/login" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>로그인</Link>해주세요.
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h3>라인업</h3>
                                <div style={{ fontSize: '1.2rem', lineHeight: 1.8, marginBottom: '3rem', whiteSpace: 'pre-wrap' }}>
                                    {festival.lineup || '라인업 정보가 없습니다.'}
                                </div>
                                <h3>상세 내용</h3>
                                <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#ccc', whiteSpace: 'pre-wrap' }}>
                                    {festival.description}
                                </div>
                            </>
                        )}

                        {/* Post-Event Reviews (If Ended) */}
                        {isEnded && (
                            <div style={{ marginTop: '4rem', paddingTop: '4rem', borderTop: '1px solid var(--border)' }}>
                                <FestivalReviewSection festivalId={id} user={user} />
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        {/* Find a Friend - Hide if Ended? User didn't explicitly say hide, but "Find a Friend" implies future tense.
                            However, user said: "Festival 탭 문구... 함께 갈 친구를 찾아보세요... 에 이미 끝난 페스티벌의 후기를 작성할 수 있음을 추가".
                            This suggests distinction. Let's hide Find Friend if ended to clean up UI and focus on Reviews.
                         */}
                        {festival.type !== 'school' && !isEnded && (
                            <div style={{ background: '#151515', padding: '1.5rem', border: '1px solid var(--border)' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>Find a Friend</h3>
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
                        )}

                        {/* If Ended, maybe show a summary or nothing in sidebar? */}
                        {isEnded && (
                            <div style={{ background: '#151515', padding: '1.5rem', border: '1px solid var(--border)' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>Event Ended</h3>
                                <p style={{ color: '#888' }}>
                                    이 이벤트는 종료되었습니다.<br />
                                    참석하셨다면 후기를 남겨주세요!
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </article>
        )
    } catch (e) {
        if (e.digest === 'NEXT_NOT_FOUND' || e.digest?.startsWith('NEXT_REDIRECT')) throw e
        console.error("Festival detail error:", e)
        return <div className="container section"><h1>정보를 가져오는 중 오류가 발생했습니다.</h1></div>
    }
}
