import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Security Check: Only allow if authenticated (or you can use a secret query param if auth is broken)
    // For now, let's require User Login + specific email OR a secret key
    const secret = request.nextUrl.searchParams.get('secret')

    // BACKDOOR SECRET: 'ditchfork_beta_2026'
    if (secret !== 'ditchfork_beta_2026') {
        if (!user || user.email !== 'id01035206992@gmail.com') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const response = NextResponse.redirect(new URL('/', request.url))

    // Set cookie for 30 days
    response.cookies.set('maintenance_bypass', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    return response
}
