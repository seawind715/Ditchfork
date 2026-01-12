import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Safety check for environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return response
    }

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            request.cookies.set(name, value)
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_banned')
                .eq('id', user.id)
                .maybeSingle()

            if (profile?.is_banned && !request.nextUrl.pathname.startsWith('/banned')) {
                return NextResponse.redirect(new URL('/banned', request.url))
            }
        }
    } catch (e) {
        console.error('Middleware Supabase error:', e)
    }

    // --- MAINTENANCE MODE LOGIC ---
    // Check for bypass cookie
    const bypassCookie = request.cookies.get('maintenance_bypass')
    const isMaintenance = false // Temporarily disabled for debugging

    if (isMaintenance && !bypassCookie) {
        // Allow access to:
        // 1. /coming-soon (The landing page)
        // 2. /api/admin/maintenance-bypass (The backdoor)
        // 3. /login, /auth (To allow logging in to get the cookie/check user)
        // 4. /_next, /static, etc (Already handled by config matcher usually, but good to be safe)
        // 5. /fonts, /images (Assets)

        const path = request.nextUrl.pathname
        if (
            !path.startsWith('/coming-soon') &&
            !path.startsWith('/api/admin/maintenance-bypass') &&
            !path.startsWith('/login') &&
            !path.startsWith('/auth') &&
            !path.startsWith('/_next') &&
            !path.match(/\.(png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2)$/)
        ) {
            return NextResponse.redirect(new URL('/coming-soon', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
