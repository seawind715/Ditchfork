import { createClient } from '@/utils/supabase/server'
import FestivalCard from '@/components/FestivalCard'
import Link from 'next/link'

export const revalidate = 0

export default async function FestivalsPage({ searchParams }) {
    const supabase = await createClient()
    const { tab } = await searchParams
    const currentTab = tab || 'upcoming' // Default to 'upcoming'

    if (!supabase) {
        return <div className="container section"><h1>데이터베이스 연결 오류</h1></div>
    }

    try {
        const now = new Date()
        const nowISO = now.toISOString()

        // Get Auth User
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user || null

        // Fetch ALL festivals to handle complex date logic (or optimize query based on tab)
        // Optimizing query based on tab:
        let query = supabase.from('festivals').select('*')

        // Fetching all for now because "Ongoing" is (start <= now <= end)
        // and Supabase simple filters might be tricky with "OR" logic mixed with others.
        // Simple approach: Fetch all, filter in JS. Not performant for huge data, but fine now.
        // Better: Use specific queries per tab.

        let festivals = []
        let error = null

        if (currentTab === 'ended') {
            const { data, error: err } = await supabase
                .from('festivals')
                .select('*')
                .lt('end_date', nowISO) // Assuming end_date exists. If null (single day), use start_date? 
                // Logic: If end_date is null, use start_date < now.
                // Since mixed, fetch ample and filter JS might be safer for "Ongoing".
                // Let's stick to fetch all for simplicity and correctness with the new end_date column.
                .order('start_date', { ascending: false }) // Newest ended first

            // Re-fetch all for safe filtering
        }

        // FETCH ALL Strategy for safety with new "multi-day" logical complexity
        const { data: allFestivals, error: fetchError } = await supabase
            .from('festivals')
            .select('*')
            .order('start_date', { ascending: currentTab === 'ended' ? false : true })

        if (fetchError) error = fetchError
        else {
            festivals = allFestivals.filter(f => {
                const start = new Date(f.start_date)
                // Default 1 day duration for logic if null
                const end = f.end_date ? new Date(f.end_date) : new Date(start.getTime() + 24 * 60 * 60 * 1000)

                if (currentTab === 'upcoming') {
                    return start > now
                } else if (currentTab === 'ongoing') {
                    // Logic: Started but not ended (or end of start day)
                    const endCompare = f.end_date ? new Date(f.end_date) : new Date(start.setHours(23, 59, 59, 999))
                    return new Date(f.start_date) <= now && endCompare >= now
                } else if (currentTab === 'ended') {
                    const endCompare = f.end_date ? new Date(f.end_date) : new Date(start.setHours(23, 59, 59, 999))
                    return endCompare < now
                }
                return false
            })

            // Custom Sort: "Upcoming" -> School first, then Date
            if (currentTab === 'upcoming') {
                festivals.sort((a, b) => {
                    // 1. School Priority
                    if (a.type === 'school' && b.type !== 'school') return -1
                    if (a.type !== 'school' && b.type === 'school') return 1

                    // 2. Date Ascending
                    return new Date(a.start_date) - new Date(b.start_date)
                })
            }
        }

        return (
            <div className="container section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem' }}>Events</h1>
                        <p style={{ color: '#888' }}>
                            다가오는 이벤트를 확인하고, 지난 이벤트의 후기를 남겨보세요.
                        </p>
                    </div>
                    {user && (
                        <Link href="/festivals/new" className="btn">
                            + 이벤트 등록
                        </Link>
                    )}
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    <Link
                        href="/festivals?tab=ended"
                        className="btn btn-outline"
                        style={{
                            background: currentTab === 'ended' ? 'var(--primary)' : 'transparent',
                            color: currentTab === 'ended' ? 'white' : '#888',
                            border: 'none',
                            fontSize: '1.2rem',
                            fontWeight: 700
                        }}
                    >
                        Ended
                    </Link>
                    <Link
                        href="/festivals?tab=ongoing"
                        className="btn btn-outline"
                        style={{
                            background: currentTab === 'ongoing' ? 'var(--primary)' : 'transparent',
                            color: currentTab === 'ongoing' ? 'white' : '#888',
                            border: 'none',
                            fontSize: '1.2rem',
                            fontWeight: 700
                        }}
                    >
                        Ongoing
                    </Link>
                    <Link
                        href="/festivals?tab=upcoming"
                        className="btn btn-outline"
                        style={{
                            background: currentTab === 'upcoming' ? 'var(--primary)' : 'transparent',
                            color: currentTab === 'upcoming' ? 'white' : '#888',
                            border: 'none',
                            fontSize: '1.2rem',
                            fontWeight: 700
                        }}
                    >
                        Upcoming
                    </Link>
                </div>

                {error && <div style={{ color: 'red' }}>Error loading events</div>}

                <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    {festivals?.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                            <p>
                                {currentTab === 'upcoming' && '예정된 이벤트가 없습니다.'}
                                {currentTab === 'ongoing' && '진행 중인 이벤트가 없습니다.'}
                                {currentTab === 'ended' && '종료된 이벤트가 없습니다.'}
                            </p>
                        </div>
                    ) : (
                        festivals?.map(festival => (
                            <FestivalCard key={festival.id} festival={festival} userEmail={user?.email} />
                        ))
                    )}
                </div>
            </div>
        )
    } catch (e) {
        if (e.digest === 'NEXT_NOT_FOUND' || e.digest?.startsWith('NEXT_REDIRECT')) throw e
        console.error("Festivals page error:", e)
        return <div className="container section"><h1>정보를 가져오는 중 오류가 발생했습니다.</h1></div>
    }
}
