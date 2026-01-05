import { createClient } from '@/utils/supabase/server'
import FestivalCard from '@/components/FestivalCard'
import Link from 'next/link'

export const revalidate = 0

export default async function FestivalsPage() {
    const supabase = await createClient()

    // Get current time in ISO format for comparison
    const now = new Date().toISOString()

    // Get Auth User
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch UPCOMING festivals
    const { data: festivals, error } = await supabase
        .from('festivals')
        .select('*')
        .gte('start_date', now) // Greater than or equal to Now
        .order('start_date', { ascending: true })

    return (
        <div className="container section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '3rem' }}>Festivals</h1>
                    <p style={{ color: '#888' }}>다가오는 뮤직 페스티벌 일정을 확인하고 함께 갈 친구를 찾아보세요.</p>
                </div>
                {user && (
                    <Link href="/festivals/new" className="btn">
                        + 페스티벌 등록
                    </Link>
                )}
            </div>

            {error && <div style={{ color: 'red' }}>Error loading festivals</div>}

            <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                {festivals?.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                        <p>예정된 페스티벌이 없습니다.</p>
                        <p style={{ marginTop: '1rem' }}>새로운 페스티벌 정보를 공유해주세요!</p>
                    </div>
                ) : (
                    festivals?.map(festival => (
                        <FestivalCard key={festival.id} festival={festival} userEmail={user?.email} />
                    ))
                )}
            </div>
        </div>
    )
}
