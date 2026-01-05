import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export const revalidate = 0

export default async function ProfilePage() {
    const supabase = createClient()

    // 1. Get User
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Get Profile Data
    const { data: profile } = await (await supabase)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="container section">
            <h1 style={{ marginBottom: '2rem' }}>Account</h1>
            <ProfileForm user={user} profile={profile} />
        </div>
    )
}
