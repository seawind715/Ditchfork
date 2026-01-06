'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminUpdateLinksButton({ review, userEmail }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const adminEmail = 'id01035206992@gmail.com'
    const isAdmin = userEmail?.toLowerCase() === adminEmail.toLowerCase()

    if (!isAdmin) return null

    const updateLinks = async () => {
        setLoading(true)
        try {
            // Use only the first artist for iTunes search (iTunes typically lists one primary artist)
            const artistList = review.artist_name.split(',').map(a => a.trim())
            const firstArtist = artistList[0]
            const term = encodeURIComponent(`${firstArtist} ${review.album_name}`)

            // Try US store first then KR store
            const stores = ['US', 'KR']
            let allResults = []

            for (const country of stores) {
                const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=album&limit=20&country=${country}`)
                const data = await response.json()

                if (data.results && data.results.length > 0) {
                    const ranked = data.results.map(res => {
                        const itunesArtist = res.artistName?.toLowerCase() || ''

                        // Check if any of our artists match the iTunes artist
                        const aMatch = artistList.some(name =>
                            itunesArtist.includes(name.toLowerCase()) || name.toLowerCase().includes(itunesArtist)
                        )
                        const cMatch = res.collectionName?.toLowerCase().includes(review.album_name.toLowerCase()) || review.album_name.toLowerCase().includes(res.collectionName?.toLowerCase())

                        let score = 0
                        if (aMatch) score += 2
                        if (cMatch) score += 3
                        if (artistList.some(name => name.toLowerCase() === itunesArtist)) score += 3
                        if (res.collectionName?.toLowerCase() === review.album_name.toLowerCase()) score += 7

                        return { ...res, score }
                    })
                    allResults = [...allResults, ...ranked]
                }
            }

            // Pick the best across all stores
            const bestResult = allResults.sort((a, b) => b.score - a.score)[0]

            // Lower threshold to handle cross-language artist names (e.g., B-Free vs 비프리)
            // Album name match (score 3) is more reliable than artist name in these cases
            if (bestResult && bestResult.score >= 3) {
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
