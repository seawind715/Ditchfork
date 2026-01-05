import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        if (supabase) {
            try {
                const { error } = await supabase.auth.exchangeCodeForSession(code)
                if (!error) {
                    return NextResponse.redirect(`${origin}${next}`)
                }
            } catch (e) {
                console.error('Auth callback error:', e)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
