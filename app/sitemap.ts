import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://ditchfork.vercel.app' // Replace with your actual domain

    // Create a direct client for public data fetching (bypassing Auth helper to avoid cookie issues in static gen)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Static Routes
    const routes = [
        '',
        '/reviews',
        '/festivals',
        '/notices',
        '/movies',
        '/profile',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // 2. Dynamic Routes: Reviews (Latest 100)
    const { data: reviews } = await supabase
        .from('reviews')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

    const reviewUrls = reviews?.map((review) => ({
        url: `${baseUrl}/reviews/${review.id}`,
        lastModified: review.created_at,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    })) || []

    // 3. Dynamic Routes: Notices (All)
    const { data: notices } = await supabase
        .from('notices')
        .select('id, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

    const noticeUrls = notices?.map((notice) => ({
        url: `${baseUrl}/notices/${notice.id}`,
        lastModified: notice.created_at,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    })) || []

    return [...routes, ...reviewUrls, ...noticeUrls]
}
