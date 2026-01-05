'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewReviewPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Sub-genre state
    const [subGenres, setSubGenres] = useState([])
    const [currentSubGenre, setCurrentSubGenre] = useState('')

    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [isFetchingCover, setIsFetchingCover] = useState(false)
    const [streamingLinks, setStreamingLinks] = useState({
        spotify: '',
        apple: '',
        youtube: ''
    })

    const handleAddSubGenre = (e) => {
        e.preventDefault() // prevent form submission
        if (subGenres.length >= 5) {
            alert('세부 장르는 최대 5개까지만 추가할 수 있습니다.')
            return
        }
        const tag = currentSubGenre.trim()
        if (tag && !subGenres.includes(tag)) {
            setSubGenres([...subGenres, tag])
            setCurrentSubGenre('')
        }
    }

    const handleRemoveSubGenre = (tag) => {
        setSubGenres(subGenres.filter(g => g !== tag))
    }

    const [artists, setArtists] = useState([])
    const [currentArtistName, setCurrentArtistName] = useState('')
    const [albumName, setAlbumName] = useState('')
    const [genre, setGenre] = useState('')
    const [year, setYear] = useState('')
    const [isAutoFilling, setIsAutoFilling] = useState(false)

    const handleAddArtist = (e) => {
        if (e) e.preventDefault()
        const tag = currentArtistName.trim()
        if (tag && !artists.includes(tag)) {
            setArtists([...artists, tag])
            setCurrentArtistName('')
        }
    }

    const handleRemoveArtist = (tag) => {
        setArtists(artists.filter(a => a !== tag))
    }

    const fetchExistingAlbumData = async (artist, album) => {
        if (!artist || !album) return

        setIsAutoFilling(true)
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .ilike('artist_name', artist.trim())
                .ilike('album_name', album.trim())
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (data) {
                // Auto-fill existing metadata
                setGenre(data.genre || '')
                setYear(data.release_year || '')
                setCoverImageUrl(data.cover_image_url || '')
                setSubGenres(data.sub_genres || [])
                setStreamingLinks({
                    spotify: data.spotify_url || '',
                    apple: data.apple_music_url || '',
                    youtube: data.youtube_music_url || ''
                })
            }
        } catch (err) {
            console.error('Auto-fill error:', err)
        } finally {
            setIsAutoFilling(false)
        }
    }

    const fetchCover = async () => {
        const artistList = artists.length > 0 ? artists.join(', ') : currentArtistName.trim()
        const album = albumName.trim()

        if (!artistList || !album) {
            alert('아티스트와 앨범명을 먼저 입력해주세요.')
            return
        }

        setIsFetchingCover(true)
        try {
            const term = encodeURIComponent(`${artistList} ${album}`)

            // Try US store first then KR store
            const stores = ['US', 'KR']
            let allResults = []

            for (const country of stores) {
                const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=album&limit=20&country=${country}`)
                const data = await response.json()

                if (data.results && data.results.length > 0) {
                    const ranked = data.results.map(res => {
                        const aMatch = res.artistName?.toLowerCase().includes(artistList.toLowerCase()) || artistList.toLowerCase().includes(res.artistName?.toLowerCase())
                        const cMatch = res.collectionName?.toLowerCase().includes(album.toLowerCase()) || album.toLowerCase().includes(res.collectionName?.toLowerCase())

                        let score = 0
                        if (aMatch) score += 2
                        if (cMatch) score += 3
                        if (res.artistName?.toLowerCase() === artistList.toLowerCase()) score += 3
                        if (res.collectionName?.toLowerCase() === album.toLowerCase()) score += 7

                        return { ...res, score }
                    })
                    allResults = [...allResults, ...ranked]
                }
            }

            // Pick the best across all stores
            const bestResult = allResults.sort((a, b) => b.score - a.score)[0]

            if (bestResult && bestResult.score >= 2) {
                const highResUrl = bestResult.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
                setCoverImageUrl(highResUrl)

                if (bestResult.collectionViewUrl) {
                    try {
                        const odesliResponse = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(bestResult.collectionViewUrl)}`)
                        const odesliData = await odesliResponse.json()

                        setStreamingLinks({
                            spotify: odesliData.linksByPlatform?.spotify?.url || '',
                            apple: odesliData.linksByPlatform?.appleMusic?.url || bestResult.collectionViewUrl,
                            youtube: odesliData.linksByPlatform?.youtubeMusic?.url || odesliData.linksByPlatform?.youtube?.url || ''
                        })
                    } catch (err) {
                        console.error('Odesli fetch error:', err)
                        setStreamingLinks({
                            spotify: '',
                            apple: bestResult.collectionViewUrl,
                            youtube: ''
                        })
                    }
                }
            } else {
                alert('가장 잘 일치하는 앨범을 찾을 수 없습니다. 직접 정보를 입력하거나 검색어를 수정해 보세요.')
            }
        } catch (error) {
            console.error('Fetch error:', error)
            alert('정보를 가져오는 중 오류가 발생했습니다.')
        } finally {
            setIsFetchingCover(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target)
        const artistList = artists.length > 0 ? artists : (currentArtistName.trim() ? [currentArtistName.trim()] : [])
        const artistNameStr = artistList.join(', ')

        const review = {
            album_name: formData.get('album_name'),
            artist_name: artistNameStr,
            release_year: formData.get('release_year'),
            genre: formData.get('genre'),
            sub_genres: subGenres, // Include the array
            cover_image_url: coverImageUrl || formData.get('cover_image_url'),
            rating: parseFloat(formData.get('rating')),
            content: formData.get('content'),
            spotify_url: streamingLinks.spotify,
            apple_music_url: streamingLinks.apple,
            youtube_music_url: streamingLinks.youtube
        }

        // Get current user
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user || null

        if (!user) {
            alert('로그인이 필요합니다.')
            router.push('/login')
            return
        }

        // --- Rate Limit Check (5 reviews per 24 hours) ---
        const adminEmail = 'id01035206992@gmail.com'
        const isAdmin = user.email?.toLowerCase().trim() === adminEmail.toLowerCase().trim()

        if (!isAdmin) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            const { count, error: countError } = await supabase
                .from('reviews')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', twentyFourHoursAgo)

            if (countError) {
                console.error('Rate limit check error:', countError)
            } else if (count >= 5) {
                alert('하루에 작성할 수 있는 리뷰 개수(5개)를 초과했습니다. 내일 다시 시도해주세요!')
                setLoading(false)
                return
            }
        }
        // ------------------------------------------------

        const { toTitleCase } = await import('@/utils/format')
        const normalizedArtist = toTitleCase(review.artist_name)
        const normalizedAlbum = toTitleCase(review.album_name)
        const normalizedGenre = toTitleCase(review.genre)
        const normalizedSubGenres = subGenres.map(g => toTitleCase(g))

        const { error } = await supabase
            .from('reviews')
            .insert({
                ...review,
                artist_name: normalizedArtist,
                album_name: normalizedAlbum,
                genre: normalizedGenre,
                sub_genres: normalizedSubGenres,
                user_id: user.id
            })

        if (error) {
            console.error(error)
            alert('저장 실패: ' + error.message)
        } else {
            alert('리뷰가 등록되었습니다!')
            router.push('/')
        }
        setLoading(false)
    }

    return (
        <div className="section container" style={{ maxWidth: '800px' }}>
            <h1>새 리뷰 작성</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                        <label>아티스트 (여러 명 가능) *</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                placeholder="예: NewJeans"
                                value={currentArtistName}
                                onChange={(e) => setCurrentArtistName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleAddArtist()
                                        fetchExistingAlbumData([...artists, currentArtistName.trim()].join(', '), albumName)
                                    }
                                }}
                                style={{ marginBottom: 0 }}
                            />
                            <button type="button" onClick={() => {
                                handleAddArtist()
                                fetchExistingAlbumData([...artists, currentArtistName.trim()].join(', '), albumName)
                            }} className="btn btn-outline" style={{ width: 'auto', padding: '0 1rem' }}>추가</button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', minHeight: '30px', marginBottom: '0.5rem' }}>
                            {artists.map(tag => (
                                <span key={tag} style={{
                                    background: 'var(--brand)',
                                    color: 'white',
                                    padding: '0.2rem 0.6rem',
                                    fontSize: '0.8rem',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontWeight: 700
                                }}>
                                    {tag}
                                    <button type="button" onClick={() => {
                                        const newArtists = artists.filter(a => a !== tag)
                                        handleRemoveArtist(tag)
                                        fetchExistingAlbumData(newArtists.join(', '), albumName)
                                    }} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}>&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label>앨범명 *</label>
                        <input
                            name="album_name"
                            required
                            placeholder="예: Get Up"
                            value={albumName}
                            onChange={(e) => setAlbumName(e.target.value)}
                            onBlur={() => fetchExistingAlbumData(artists.join(', '), albumName)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>발매 연도 *</label>
                        <input
                            name="release_year"
                            required
                            placeholder="예: 2023"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>커버 이미지 URL</label>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <input
                                name="cover_image_url"
                                value={coverImageUrl}
                                onChange={(e) => setCoverImageUrl(e.target.value)}
                                placeholder="이미지 찾기 버튼을 눌러주세요"
                                style={{ width: '100%', marginBottom: 0 }}
                            />
                            <button
                                type="button"
                                onClick={fetchCover}
                                className="btn btn-outline"
                                style={{ width: 'auto', padding: '0 1rem', whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                                disabled={isFetchingCover || isAutoFilling}
                            >
                                {isFetchingCover ? '찾는 중...' : '이미지 찾기'}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#888' }}>
                            위의 '이미지 찾기' 버튼을 누르면 정식 앨범 커버와 스트리밍 링크가 자동 입력됩니다.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <div>
                        <label>장르 (메인) *</label>
                        <select
                            name="genre"
                            required
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            <option value="Rock">Rock</option>
                            <option value="Pop">Pop</option>
                            <option value="Hip-Hop">Hip-Hop</option>
                            <option value="Electronic">Electronic</option>
                            <option value="Jazz">Jazz</option>
                            <option value="Classical Music">Classical Music</option>
                            <option value="K-Pop">K-Pop</option>
                            <option value="Folk">Folk</option>
                            <option value="Experimental">Experimental</option>
                            <option value="Uncategorized">Uncategorized</option>
                        </select>
                    </div>
                    <div>
                        <label>평점 (0.0 ~ 10.0) *</label>
                        <input name="rating" type="number" step="0.1" min="0" max="10" required placeholder="6.5" />
                    </div>
                </div>

                {/* Sub-genre Input Section */}
                <div>
                    <label>세부 장르 (영문 작성 권장, 최대 5개)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            value={currentSubGenre}
                            onChange={(e) => setCurrentSubGenre(e.target.value)}
                            placeholder="예: Shoegaze, Dream Pop (영어로 입력)"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault(); // Stop form submit
                                    handleAddSubGenre(e);
                                }
                            }}
                            style={{ marginBottom: 0 }}
                        />
                        <button type="button" onClick={handleAddSubGenre} className="btn btn-outline" style={{ width: 'auto', padding: '0 1.5rem' }}>추가</button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', minHeight: '30px' }}>
                        {subGenres.map(tag => (
                            <span key={tag} style={{
                                background: 'var(--accent)',
                                color: 'var(--background)',
                                padding: '0.3rem 0.8rem',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                {tag}
                                <button type="button" onClick={() => handleRemoveSubGenre(tag)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 0.5 }}>&times;</button>
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <label>리뷰 내용 *</label>
                    <textarea name="content" rows={10} required placeholder="이 앨범에 대한 당신의 생각을 자유롭게 적어주세요." style={{ width: '100%', padding: '1rem', background: 'var(--input)', border: '1px solid var(--border)', color: 'white' }}></textarea>
                </div>

                <button type="submit" className="btn" disabled={loading} style={{ padding: '1rem', fontSize: '1.2rem' }}>
                    {loading ? '등록 중...' : '리뷰 등록하기'}
                </button>
            </form>
        </div>
    )
}
