import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export const revalidate = 0

export default async function ProfilePage() {
    const supabase = await createClient()

    if (!supabase) {
        return <div className="container section"><h1>데이터베이스 연결 오류</h1></div>
    }

    let user = null
    let profile = null

    try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        user = currentUser

        if (!user) {
            redirect('/login')
        }

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
        profile = data
    } catch (e) {
        console.error("Profile page error:", e)
        // If it's a redirect error from Next.js, we should re-throw it
        if (e.digest?.startsWith('NEXT_REDIRECT')) throw e
        redirect('/login')
    }

    return (
        <div className="container section">
            <h1 style={{ marginBottom: '2rem' }}>Account</h1>
            <ProfileForm user={user} profile={profile} />
        </div>
    )
}
