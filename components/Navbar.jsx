'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar({ user }) {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link href="/" className="logo">
                    Ditchfork
                </Link>

                <ul className="nav-links">
                    <li><Link href="/reviews" className="nav-item">Album</Link></li>
                    <li><Link href="/festivals" className="nav-item">Event</Link></li>
                    <li><Link href="/movies" className="nav-item">Movie</Link></li>

                    {user ? (
                        <>
                            <li style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                <form action="/reviews" style={{ display: 'flex', alignItems: 'center', background: '#222', padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1px solid #333' }}>
                                    <input
                                        name="q"
                                        placeholder="Search..."
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'white',
                                            outline: 'none',
                                            fontSize: '0.9rem',
                                            width: '120px'
                                        }}
                                    />
                                    <button type="submit" style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        </svg>
                                    </button>
                                </form>
                            </li>
                            <li>
                                <Link
                                    href="/reviews/new"
                                    className="btn"
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        fontSize: '0.9rem',
                                        fontFamily: 'var(--font-sans)',
                                        letterSpacing: '-0.02em',
                                        marginRight: '1rem'
                                    }}
                                >
                                    + 리뷰 작성
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile" aria-label="마이페이지" style={{ display: 'flex', alignItems: 'center' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li><Link href="/login" className="nav-item">로그인</Link></li>
                    )}
                </ul>
            </div>
        </nav >
    )
}
