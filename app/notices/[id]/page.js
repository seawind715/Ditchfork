import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import NoticeCommentSection from '@/components/NoticeCommentSection'
import AdminDeleteButton from '@/components/AdminDeleteButton'

export const revalidate = 0

export async function generateMetadata({ params }) {
    const { id } = await params
    try {
        const supabase = await createClient()
        if (!supabase) return { title: 'Ditchfork' }

        const { data: notice } = await supabase
            .from('notices')
            .select('title')
            .eq('id', id)
            .single()

        if (!notice) return { title: 'Ditchfork' }

        return {
            title: `${notice.title} | Notice | 디치포크 Ditchfork`,
            description: `Ditchfork 공지사항: ${notice.title}`,
        }
    } catch (e) {
        return { title: 'Ditchfork' }
    }
}

export default async function NoticeDetailPage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: notice } = await supabase
        .from('notices')
        .select(`
            *,
            profiles (username)
        `)
        .eq('id', id)
        .maybeSingle()

    if (!notice) notFound()

    const { data: { user } } = await supabase.auth.getUser()
    const isAdmin = user?.email === 'id01035206992@gmail.com'

    return (
        <article className="container section" style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Link href="/notices" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← List
                    </Link>
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{notice.title}</h1>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#888', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <span>작성자: {notice.profiles?.username || 'Admin'}</span>
                        <span>날짜: {new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link href={`/notices/edit/${notice.id}`} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderColor: '#444' }}>
                                수정
                            </Link>
                            <AdminDeleteButton table="notices" id={notice.id} redirectTo="/notices" userEmail={user?.email} />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', color: '#ccc', minHeight: '200px' }}>
                {notice.content}
            </div>

            <NoticeCommentSection noticeId={notice.id} user={user} />
        </article>
    )
}
