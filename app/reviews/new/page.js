'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toTitleCase } from '@/utils/format'
import ScoreGuide from '@/components/ScoreGuide'
import { searchMovies, getMovieDetails, getPosterUrl } from '@/utils/tmdb'

const NewReviewPageContent = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const [category, setCategory] = useState('music') // 'music' or 'movie'

    // --- Auto-fill from URL ---
    useEffect(() => {
        const mode = searchParams.get('mode')
        if (mode) {
            setCategory(mode)
            if (mode === 'music') {
                const artist = searchParams.get('artist')
                const album = searchParams.get('album')
                if (artist) { setCurrentArtistName(artist); setArtists([artist]); }
                if (album) { setAlbumName(album); }
                if (artist && album) { fetchExistingAlbumData(artist, album); }
            } else if (mode === 'movie') {
                const title = searchParams.get('title')
                if (title) { setMovieTitle(title); }
            }
        }
    }, [searchParams])


    // Duplicate state removed


    // --- Common State ---
    const [rating, setRating] = useState('')
    const [content, setContent] = useState('')

    // --- Music State ---
    const [subGenres, setSubGenres] = useState([])
    const [currentSubGenre, setCurrentSubGenre] = useState('')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [isCoverHidden, setIsCoverHidden] = useState(false)
    const [isFetchingCover, setIsFetchingCover] = useState(false)
    const [streamingLinks, setStreamingLinks] = useState({ spotify: '', apple: '', youtube: '' })
    const [artists, setArtists] = useState([])
    const [currentArtistName, setCurrentArtistName] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [albumName, setAlbumName] = useState('')
    const [genre, setGenre] = useState('') // Music Main Genre
    const [year, setYear] = useState('')
    const [isAutoFilling, setIsAutoFilling] = useState(false)

    // --- Movie State ---
    const [movieTitle, setMovieTitle] = useState('')
    const [movieDirector, setMovieDirector] = useState('') // For search query mostly
    const [movieSearchResults, setMovieSearchResults] = useState([])
    const [selectedMovie, setSelectedMovie] = useState(null) // Stores full metadata
    const [movieGenres, setMovieGenres] = useState([]) // English tags, max 5
    const [currentMovieGenre, setCurrentMovieGenre] = useState('')

    // --- Music Handlers ---
    const handleAddSubGenre = (e) => {
        e.preventDefault()
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
    const handleRemoveSubGenre = (tag) => setSubGenres(subGenres.filter(g => g !== tag))

    const handleAddArtist = (e) => {
        if (e) e.preventDefault()
        const tag = currentArtistName.trim()
        if (tag && !artists.includes(tag)) {
            setArtists([...artists, tag])
            setCurrentArtistName('')
        }
    }
    const handleRemoveArtist = (tag) => setArtists(artists.filter(a => a !== tag))

    const fetchArtistSuggestions = async (query) => {
        if (!query || query.length < 1) { setSuggestions([]); return }
        const { data } = await supabase.from('reviews').select('artist_name').ilike('artist_name', `%${query}%`).order('created_at', { ascending: false }).limit(50)
        if (data) {
            const all = data.flatMap(row => row.artist_name.split(',').map(s => s.trim()))
            const matched = all.filter(name => name.toLowerCase().includes(query.toLowerCase()))
            const unique = [...new Set(matched)]
            setSuggestions(unique.slice(0, 5))
            setShowSuggestions(true)
        }
    }

    const fetchExistingAlbumData = async (artist, album) => {
        if (!artist || !album) return
        setIsAutoFilling(true)
        try {
            const { data } = await supabase.from('reviews').select('*').ilike('artist_name', artist.trim()).ilike('album_name', album.trim()).order('created_at', { ascending: false }).limit(1).maybeSingle()
            if (data) {
                setGenre(data.genre || '')
                setYear(data.release_year || '')
                setCoverImageUrl(data.cover_image_url || '')
                setSubGenres(data.sub_genres || [])
                setStreamingLinks({ spotify: data.spotify_url || '', apple: data.apple_music_url || '', youtube: data.youtube_music_url || '' })
            }
        } finally { setIsAutoFilling(false) }
    }

    const fetchAlbumFromAppleMusic = async (url) => {
        // ... (Existing Apple Music Logic - Keeping it concise for replacement block limits)
        // Re-using existing logic logic but simplified for brevity in this replace block if needed, 
        // OR assuming we keep the complex logic. 
        // Given constraints, I will keep the original logic for Apple Music fully.
        const albumIdMatch = url.match(/\/album\/[^\/]+\/(\d+)/) || url.match(/\/album\/\d+/)
        const albumId = albumIdMatch ? albumIdMatch[1] : null
        if (!albumId) return false
        setIsFetchingCover(true)
        try {
            const response = await fetch(`https://itunes.apple.com/lookup?id=${albumId}&country=kr`)
            const data = await response.json()
            if (data.results && data.results.length > 0) {
                const albumData = data.results[0]
                const highResUrl = albumData.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
                setCoverImageUrl(highResUrl)
                setAlbumName(albumData.collectionName)
                setYear(albumData.releaseDate.substring(0, 4))
                const artistStr = albumData.artistName
                const detectedArtists = artistStr.split(/&|,/).map(a => a.trim()).filter(a => a)
                setArtists(detectedArtists)
                setCurrentArtistName('')

                try {
                    const appleMusicLink = albumData.collectionViewUrl
                    const odesliResponse = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(appleMusicLink)}`)
                    const odesliData = await odesliResponse.json()
                    setStreamingLinks({
                        spotify: odesliData.linksByPlatform?.spotify?.url || '',
                        apple: appleMusicLink,
                        youtube: odesliData.linksByPlatform?.youtubeMusic?.url || odesliData.linksByPlatform?.youtube?.url || ''
                    })
                } catch (err) {
                    setStreamingLinks(prev => ({ ...prev, apple: albumData.collectionViewUrl }))
                }
                return true
            }
        } catch (error) { console.error(error) } finally { setIsFetchingCover(false) }
        return false
    }

    const fetchCover = async () => {
        const artistList = artists.length > 0 ? artists.join(', ') : currentArtistName.trim()
        const album = albumName.trim()
        if (!artistList || !album) { alert('아티스트와 앨범명을 먼저 입력해주세요.'); return }
        setIsFetchingCover(true)
        try {
            const firstArtist = artists.length > 0 ? artists[0] : currentArtistName.trim()
            const searchTerms = [encodeURIComponent(`${firstArtist} ${album}`)]
            const stores = ['US', 'KR']
            let allResults = []
            for (const country of stores) {
                for (const term of searchTerms) {
                    const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=album&limit=20&country=${country}`)
                    const data = await response.json()
                    if (data.results) {
                        const ranked = data.results.map(res => {
                            const artistNames = artistList.split(',').map(a => a.trim().toLowerCase())
                            const itunesArtist = res.artistName?.toLowerCase() || ''
                            let score = 0
                            if (artistNames.some(name => itunesArtist.includes(name) || name.includes(itunesArtist))) score += 5
                            if (res.collectionName?.toLowerCase().includes(album.toLowerCase())) score += 5
                            return { ...res, score }
                        })
                        allResults = [...allResults, ...ranked]
                    }
                }
            }
            const bestResult = allResults.sort((a, b) => b.score - a.score)[0]
            if (bestResult) {
                setCoverImageUrl(bestResult.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg'))
                if (bestResult.collectionViewUrl) {
                    // Try fetch links
                    try {
                        const odesliResponse = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(bestResult.collectionViewUrl)}`)
                        const odesliData = await odesliResponse.json()
                        setStreamingLinks({
                            spotify: odesliData.linksByPlatform?.spotify?.url || '',
                            apple: odesliData.linksByPlatform?.appleMusic?.url || bestResult.collectionViewUrl,
                            youtube: odesliData.linksByPlatform?.youtubeMusic?.url || odesliData.linksByPlatform?.youtube?.url || ''
                        })
                    } catch (e) {
                        setStreamingLinks(prev => ({ ...prev, apple: bestResult.collectionViewUrl }))
                    }
                }
            } else { alert('이미지를 찾을 수 없습니다.') }
        } catch (e) { console.error(e); alert('오류가 발생했습니다.') } finally { setIsFetchingCover(false) }
    }

    // --- Movie Handlers ---
    const handleSearchMovie = async () => {
        if (!movieTitle) { alert('영화 제목을 입력해주세요.'); return }
        setIsFetchingCover(true)
        // Fixed: Search only by title because TMDB query confusion with director names
        const results = await searchMovies(movieTitle)
        setMovieSearchResults(results)
        setIsFetchingCover(false)
        if (results.length === 0) alert('검색 결과가 없습니다.')
    }

    const handleSelectMovie = async (movie) => {
        setIsFetchingCover(true)
        const details = await getMovieDetails(movie.id)
        if (details) {
            setSelectedMovie(details)
            setMovieSearchResults([]) // Clear search
            // Auto fill
            setMovieTitle(details.title)
            setYear(details.release_date?.substring(0, 4) || '')
            // Find Director
            const director = details.credits?.crew?.find(person => person.job === 'Director')?.name
            if (director) setMovieDirector(director)
        }
        setIsFetchingCover(false)
    }

    const handleAddMovieGenre = (e) => {
        e.preventDefault()
        if (movieGenres.length >= 5) { alert('장르는 최대 5개까지입니다.'); return }
        const tag = currentMovieGenre.trim()
        if (tag && !movieGenres.includes(tag)) {
            setMovieGenres([...movieGenres, tag])
            setCurrentMovieGenre('')
        }
    }
    const handleRemoveMovieGenre = (tag) => setMovieGenres(movieGenres.filter(g => g !== tag))


    // --- Book State ---
    const [bookTitle, setBookTitle] = useState('')
    const [bookAuthor, setBookAuthor] = useState('')
    const [kdcClass, setKdcClass] = useState('')
    const [specificGenre, setSpecificGenre] = useState('') // User input, single
    // KDC Main Classes
    const KDC_CLASSES = [
        "총류", "철학", "종교", "사회과학", "자연과학",
        "기술과학", "예술", "언어", "문학", "역사"
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { alert('로그인이 필요합니다.'); router.push('/login'); return }

        let reviewData = {
            content,
            user_id: user.id,
            category: category,
            rating: category === 'book' ? null : parseFloat(rating), // No rating for book
        }

        if (category === 'music') {
            const artistList = artists.length > 0 ? artists : (currentArtistName.trim() ? [currentArtistName.trim()] : [])
            reviewData = {
                ...reviewData,
                album_name: toTitleCase(albumName),
                artist_name: toTitleCase(artistList.join(', ')),
                release_year: year,
                genre: toTitleCase(genre),
                sub_genres: subGenres.map(g => toTitleCase(g)),
                cover_image_url: coverImageUrl,
                is_cover_hidden: isCoverHidden,
                spotify_url: streamingLinks.spotify,
                apple_music_url: streamingLinks.apple,
                youtube_music_url: streamingLinks.youtube,
            }
        } else if (category === 'movie') {
            if (!selectedMovie) {
                alert('영화를 검색하여 선택해주세요.'); setLoading(false); return
            }
            reviewData = {
                ...reviewData,
                album_name: selectedMovie.title,
                artist_name: movieDirector || 'Unknown',
                release_year: year,
                genre: 'Movie',
                sub_genres: movieGenres,
                cover_image_url: getPosterUrl(selectedMovie.poster_path),
                movie_metadata: selectedMovie
            }
        } else if (category === 'book') {
            if (!bookTitle || !bookAuthor || !kdcClass) {
                alert('책 제목, 작가, 분류를 모두 입력해주세요.'); setLoading(false); return
            }
            reviewData = {
                ...reviewData,
                album_name: bookTitle, // Reuse 'album_name' for Title
                artist_name: bookAuthor, // Reuse 'artist_name' for Author
                genre: kdcClass, // Reuse 'genre' for KDC
                sub_genres: specificGenre ? [specificGenre] : [], // Use sub_genres for specific genre (single)
                release_year: new Date().getFullYear().toString(), // Optional, or ask inputs? User didn't specify. Default to current or null? Let's use '0000' or similar if required by DB. DB constraint? likely not.
            }
        }

        const { data, error } = await supabase.from('reviews').insert(reviewData).select().single()

        if (error) {
            console.error(error); alert('저장 실패: ' + error.message)
        } else {
            router.refresh()
            router.push(`/reviews/${data.id}`)
        }
        setLoading(false)
    }

    return (
        <div className="section container" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1>새 리뷰 작성</h1>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#222', padding: '0.3rem', borderRadius: '8px' }}>
                    <button type="button" onClick={() => setCategory('music')} style={{ background: category === 'music' ? 'var(--primary)' : 'transparent', color: category === 'music' ? 'white' : '#888', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Album</button>
                    <button type="button" onClick={() => setCategory('movie')} style={{ background: category === 'movie' ? 'var(--primary)' : 'transparent', color: category === 'movie' ? 'white' : '#888', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Movie</button>
                    <button type="button" onClick={() => setCategory('book')} style={{ background: category === 'book' ? 'var(--primary)' : 'transparent', color: category === 'book' ? 'white' : '#888', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Book</button>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {category === 'music' && (
                    /* --- MUSIC FORM --- */
                    <>
                        {/* ... Existing Music Inputs (Consolidated for brevity in diff, but assuming I keep logic? NO, I need to output full block or I overwrite. The previous tool `view_file` gave me full content. I must reproduce existing logic + Book logic.) */}
                        {/* Start Music Block */}
                        <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <label>아티스트 *</label>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input value={currentArtistName} onChange={e => { setCurrentArtistName(e.target.value); fetchArtistSuggestions(e.target.value) }}
                                            placeholder="예: NewJeans" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddArtist())} style={{ width: '100%', marginBottom: 0 }} />
                                        {showSuggestions && suggestions.length > 0 && (
                                            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#222', border: '1px solid #444', zIndex: 10, listStyle: 'none', padding: 0 }}>
                                                {suggestions.map((s, i) => <li key={i} onClick={() => { setCurrentArtistName(s); setSuggestions([]); setShowSuggestions(false) }} style={{ padding: '0.5rem', cursor: 'pointer' }}>{s}</li>)}
                                            </ul>
                                        )}
                                    </div>
                                    <button type="button" onClick={handleAddArtist} className="btn btn-outline">추가</button>
                                </div>
                                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                    {artists.map(a => <span key={a} style={{ background: 'var(--brand)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{a} <button type="button" onClick={() => handleRemoveArtist(a)} style={{ border: 'none', background: 'none', color: 'white' }}>&times;</button></span>)}
                                </div>
                            </div>
                            <div>
                                <label>앨범명 *</label>
                                <input value={albumName} onChange={e => setAlbumName(e.target.value)} onBlur={() => fetchExistingAlbumData(artists.join(', '), albumName)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <label>발매 연도 *</label>
                                <input value={year} onChange={e => setYear(e.target.value)} required placeholder="2023" />
                            </div>
                            <div>
                                <label>커버 이미지 URL (Apple Music 링크 지원)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input value={coverImageUrl} onChange={e => { setCoverImageUrl(e.target.value); if (e.target.value.includes('music.apple.com')) fetchAlbumFromAppleMusic(e.target.value) }} placeholder="링크 입력" style={{ flex: 1 }} />
                                    <button type="button" onClick={fetchCover} className="btn btn-outline" disabled={isFetchingCover}>{isFetchingCover ? '...' : '찾기'}</button>
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <input type="checkbox" id="hideCover" checked={isCoverHidden} onChange={e => setIsCoverHidden(e.target.checked)} />
                                    <label htmlFor="hideCover" style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>커버 이미지 숨기기</label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <label>장르 (메인) *</label>
                                <select name="genre" value={genre} onChange={e => setGenre(e.target.value)} required>
                                    <option value="">선택</option>
                                    <option value="Rock">Rock</option><option value="Pop">Pop</option><option value="Hip-Hop">Hip-Hop</option>
                                    <option value="Electronic">Electronic</option><option value="Jazz">Jazz</option><option value="Classical Music">Classical Music</option>
                                    <option value="K-Pop">K-Pop</option><option value="Ballad">Ballad</option><option value="Folk">Folk</option>
                                    <option value="Experimental">Experimental</option><option value="Uncategorized">Uncategorized</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label>세부 장르 (영문 권장, 최대 5개)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input value={currentSubGenre} onChange={e => setCurrentSubGenre(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubGenre(e))} placeholder="예: Shoegaze" style={{ width: '200px' }} />
                                <button type="button" onClick={handleAddSubGenre} className="btn btn-outline">추가</button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {subGenres.map(g => <span key={g} style={{ background: 'var(--accent)', color: 'black', padding: '0.2rem 0.6rem', fontSize: '0.85rem' }}>{g} <button type="button" onClick={() => handleRemoveSubGenre(g)} style={{ border: 'none', background: 'none', color: 'black' }}>&times;</button></span>)}
                            </div>
                        </div>
                    </>
                )}

                {category === 'movie' && (
                    /* --- MOVIE FORM --- */
                    <>
                        <div style={{ background: '#1a1a1a', padding: '1.5rem', border: '1px solid #333' }}>
                            <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>영화 검색 (제목 / 감독)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input placeholder="예: 기생충 봉준호" value={movieTitle} onChange={e => setMovieTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchMovie())} style={{ marginBottom: 0 }} />
                                <button type="button" onClick={handleSearchMovie} className="btn btn-outline" disabled={isFetchingCover}>
                                    {isFetchingCover ? '검색 중...' : '검색'}
                                </button>
                            </div>
                            {/* Movie Search Results */}
                            {movieSearchResults.length > 0 && (
                                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '1rem 0' }}>
                                    {movieSearchResults.map(m => (
                                        <div key={m.id} onClick={() => handleSelectMovie(m)} style={{ minWidth: '100px', cursor: 'pointer', border: selectedMovie?.id === m.id ? '2px solid var(--primary)' : '1px solid #333' }}>
                                            <img src={getPosterUrl(m.poster_path)} alt={m.title} style={{ width: '100px', height: '150px', objectFit: 'cover' }} />
                                            <p style={{ fontSize: '0.8rem', textAlign: 'center', margin: '0.5rem 0' }}>{m.title} ({m.release_date?.substring(0, 4)})</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedMovie && (
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                                <img src={getPosterUrl(selectedMovie.poster_path)} style={{ width: '150px' }} />
                                <div>
                                    <h3>{selectedMovie.title}</h3>
                                    <p style={{ color: '#888' }}>{year} • {movieDirector}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '0.5rem' }}>{selectedMovie.overview?.substring(0, 150)}...</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label>장르 (Tag) (영문 권장, 선택사항, 최대 5개)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input value={currentMovieGenre} onChange={e => setCurrentMovieGenre(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddMovieGenre(e))} placeholder="예: Sci-Fi, Thriller" style={{ width: '200px' }} />
                                <button type="button" onClick={handleAddMovieGenre} className="btn btn-outline">추가</button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {movieGenres.map(g => <span key={g} style={{ background: 'var(--accent)', color: 'black', padding: '0.2rem 0.6rem', fontSize: '0.85rem' }}>{g} <button type="button" onClick={() => handleRemoveMovieGenre(g)} style={{ border: 'none', background: 'none', color: 'black' }}>&times;</button></span>)}
                            </div>
                        </div>
                    </>
                )}

                {category === 'book' && (
                    /* --- BOOK FORM --- */
                    <>
                        <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <label>책 제목 *</label>
                                <input value={bookTitle} onChange={e => setBookTitle(e.target.value)} placeholder="예: 채식주의자" required />
                            </div>
                            <div>
                                <label>작가 *</label>
                                <input value={bookAuthor} onChange={e => setBookAuthor(e.target.value)} placeholder="예: 한강" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <label>분류 (한국십진분류법) *</label>
                                <select value={kdcClass} onChange={e => setKdcClass(e.target.value)} required>
                                    <option value="">선택</option>
                                    {KDC_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>세부 장르 (직접 입력, 한글, 1개)</label>
                                <input value={specificGenre} onChange={e => setSpecificGenre(e.target.value)} placeholder="예: 현대소설" />
                            </div>
                        </div>
                    </>
                )}

                {/* Common Rating & Content (Hide Rating for Book) */}
                {category !== 'book' && (
                    <div>
                        <label>평점 (0.0 ~ 10.0) *</label>
                        <input type="number" step="0.1" min="0" max="10" required placeholder="8.5" value={rating} onChange={e => setRating(e.target.value)} style={{ width: '100px' }} />
                        <details style={{ marginTop: '0.8rem', cursor: 'pointer' }}>
                            <summary style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>📊 평점 가이드 보기</summary>
                            <div style={{ marginTop: '0.5rem' }}><ScoreGuide compact={true} /></div>
                        </details>
                    </div>
                )}

                <div>
                    <label>리뷰 내용 *</label>
                    <textarea rows={10} required placeholder={category === 'movie' ? "이 영화에 대한 감상평을 남겨주세요." : (category === 'book' ? "이 책에 대한 서평을 남겨주세요." : "이 앨범에 대한 당신의 생각을 적어주세요.")} value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', padding: '1rem', background: 'var(--input)', border: '1px solid var(--border)', color: 'white' }}></textarea>
                </div>

                <button type="submit" className="btn" disabled={loading} style={{ padding: '1rem', fontSize: '1.2rem' }}>
                    {loading ? '등록 중...' : '리뷰 등록하기'}
                </button>
            </form>
        </div>
    )
}

