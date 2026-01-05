'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminUpdateLinksButton({ review, userEmail }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const adminEmail = 'id01035206992@gmail.com'
    const isAdmin = userEmail?.toLowerCase() === adminEmail.toLowerCase()

    // Debug log to help identify why the button might be missing
    // console.log('Admin check:', { userEmail, isAdmin })

    if (!isAdmin) return null

    const updateLinks = async () => {
        setLoading(true)
        try {
            const term = encodeURIComponent(`${review.artist_name} ${review.album_name}`)

            // Try US store first then KR store
            const stores = ['US', 'KR']
            let allResults = []

            for (const country of stores) {
                const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=album&limit=20&country=${country}`)
                const data = await response.json()

                if (data.results && data.results.length > 0) {
                    const ranked = data.results.map(res => {
                        const aMatch = res.artistName?.toLowerCase().includes(review.artist_name.toLowerCase()) || review.artist_name.toLowerCase().includes(res.artistName?.toLowerCase())
                        const cMatch = res.collectionName?.toLowerCase().includes(review.album_name.toLowerCase()) || review.album_name.toLowerCase().includes(res.collectionName?.toLowerCase())

                        let score = 0
                        if (aMatch) score += 2
                        if (cMatch) score += 3
                        if (res.artistName?.toLowerCase() === review.artist_name.toLowerCase()) score += 3
                        if (res.collectionName?.toLowerCase() === review.album_name.toLowerCase()) score += 7

                        return { ...res, score }
                    })
                    allResults = [...allResults, ...ranked]
                }
            }

            // Pick the best across all stores
            const bestResult = allResults.sort((a, b) => b.score - a.score)[0]

            if (bestResult && bestResult.score >= 5) {
                const appleUrl = bestResult.collectionViewUrl

                const odesliResponse = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(appleUrl)}`)
                const odesliData = await odesliResponse.json()

                const spotifyUrl = odesliData.linksByPlatform?.spotify?.url || ''
                const youtubeUrl = odesliData.linksByPlatform?.youtubeMusic?.url || odesliData.linksByPlatform?.youtube?.url || ''

                const highResUrl = bestResult.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')

                const supabase = createClient()
                const { error } = await supabase
                    .from('reviews')
                    .update({
                        spotify_url: spotifyUrl,
                        apple_music_url: appleUrl,
                        youtube_music_url: youtubeUrl,
                        cover_image_url: highResUrl
                    })
                    .eq('id', review.id)

                if (error) throw error
                alert('스트리밍 링크가 성공적으로 업데이트되었습니다!')
                router.refresh()
            } else {
                alert('앨범을 찾을 수 없습니다.')
            }
        } catch (error) {
            console.error('Update links error:', error)
            alert('업데이트 중 오류가 발생했습니다: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={updateLinks}
            disabled={loading}
            className="btn btn-outline"
            style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                marginLeft: '0.5rem'
            }}
        >
            {loading ? '업데이트 중...' : '🎵 링크 동기화'}
        </button>
    )
}
