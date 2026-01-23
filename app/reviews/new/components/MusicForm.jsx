import React from 'react'

/**
 * 음악 앨범 리뷰 작성을 위한 폼 컴포넌트
 * @param {Object} props
 * @param {string} props.currentArtistName - 현재 입력 중인 아티스트 이름
 * @param {Function} props.setCurrentArtistName - 아티스트 이름 입력 함수
 * @param {Function} props.fetchArtistSuggestions - 아티스트 추천 검색 함수
 * @param {Function} props.handleAddArtist - 아티스트 추가 핸들러
 * @param {Array} props.suggestions - 추천 검색어 목룍
 * @param {boolean} props.showSuggestions - 추천 목록 표시 여부
 * @param {Function} props.setSuggestions - 추천 목록 설정 함수
 * @param {Function} props.setShowSuggestions - 추천 목록 표시 설정 함수
 * @param {Array} props.artists - 추가된 아티스트 리스트
 * @param {Function} props.handleRemoveArtist - 아티스트 삭제 핸들러
 * @param {string} props.albumName - 앨범명
 * @param {Function} props.setAlbumName - 앨범명 설정 함수
 * @param {Function} props.fetchExistingAlbumData - 기존 앨범 데이터 불러오기 함수
 * @param {string} props.year - 발매 연도
 * @param {Function} props.setYear - 발매 연도 설정 함수
 * @param {string} props.coverImageUrl - 커버 이미지 URL
 * @param {Function} props.setCoverImageUrl - 커버 이미지 URL 설정 함수
 * @param {Function} props.fetchAlbumFromAppleMusic - 애플뮤직 데이터 가져오기 함수
 * @param {Function} props.fetchCover - 커버 이미지 검색 함수
 * @param {boolean} props.isFetchingCover - 이미지 검색 로딩 상태
 * @param {boolean} props.isCoverHidden - 커버 이미지 숨김 여부
 * @param {Function} props.setIsCoverHidden - 숨김 여부 설정 함수
 * @param {string} props.genre - 메인 장르
 * @param {Function} props.setGenre - 메인 장르 설정 함수
 * @param {string} props.currentSubGenre - 현재 입력 중인 세부 장르
 * @param {Function} props.setCurrentSubGenre - 세부 장르 입력 함수
 * @param {Function} props.handleAddSubGenre - 세부 장르 추가 핸들러
 * @param {Array} props.subGenres - 추가된 세부 장르 리스트
 * @param {Function} props.handleRemoveSubGenre - 세부 장르 삭제 핸들러
 */
export default function MusicForm({
    currentArtistName, setCurrentArtistName, fetchArtistSuggestions, handleAddArtist,
    suggestions, showSuggestions, setSuggestions, setShowSuggestions,
    artists, handleRemoveArtist,
    albumName, setAlbumName, fetchExistingAlbumData,
    year, setYear,
    coverImageUrl, setCoverImageUrl, fetchAlbumFromAppleMusic, fetchCover, isFetchingCover,
    isCoverHidden, setIsCoverHidden,
    genre, setGenre,
    currentSubGenre, setCurrentSubGenre, handleAddSubGenre, subGenres, handleRemoveSubGenre
}) {
    return (
        <>
            <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                    <label>아티스트 *</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                value={currentArtistName}
                                onChange={e => { setCurrentArtistName(e.target.value); fetchArtistSuggestions(e.target.value) }}
                                placeholder="예: NewJeans"
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddArtist())}
                                style={{ width: '100%', marginBottom: 0 }}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#222', border: '1px solid #444', zIndex: 10, listStyle: 'none', padding: 0 }}>
                                    {suggestions.map((s, i) => (
                                        <li
                                            key={i}
                                            onClick={() => { setCurrentArtistName(s); setSuggestions([]); setShowSuggestions(false) }}
                                            style={{ padding: '0.5rem', cursor: 'pointer' }}
                                        >
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button type="button" onClick={handleAddArtist} className="btn btn-outline">추가</button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {artists.map(a => (
                            <span key={a} style={{ background: 'var(--brand)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {a} <button type="button" onClick={() => handleRemoveArtist(a)} style={{ border: 'none', background: 'none', color: 'white' }}>&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <label>앨범명 *</label>
                    <input
                        value={albumName}
                        onChange={e => setAlbumName(e.target.value)}
                        onBlur={() => fetchExistingAlbumData(artists.join(', '), albumName)}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                    <label>발매 연도 *</label>
                    <input
                        value={year}
                        onChange={e => setYear(e.target.value)}
                        required
                        placeholder="2023"
                    />
                </div>
                <div>
                    <label>커버 이미지 URL (Apple Music 링크 지원)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            value={coverImageUrl}
                            onChange={e => {
                                setCoverImageUrl(e.target.value);
                                if (e.target.value.includes('music.apple.com')) fetchAlbumFromAppleMusic(e.target.value)
                            }}
                            placeholder="링크 입력"
                            style={{ flex: 1 }}
                        />
                        <button type="button" onClick={fetchCover} className="btn btn-outline" disabled={isFetchingCover}>
                            {isFetchingCover ? '...' : '찾기'}
                        </button>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="hideCover"
                            checked={isCoverHidden}
                            onChange={e => setIsCoverHidden(e.target.checked)}
                        />
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
                    <input
                        value={currentSubGenre}
                        onChange={e => setCurrentSubGenre(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubGenre(e))}
                        placeholder="예: Shoegaze"
                        style={{ width: '200px' }}
                    />
                    <button type="button" onClick={handleAddSubGenre} className="btn btn-outline">추가</button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {subGenres.map(g => (
                        <span key={g} style={{ background: 'var(--accent)', color: 'black', padding: '0.2rem 0.6rem', fontSize: '0.85rem' }}>
                            {g} <button type="button" onClick={() => handleRemoveSubGenre(g)} style={{ border: 'none', background: 'none', color: 'black' }}>&times;</button>
                        </span>
                    ))}
                </div>
            </div>
        </>
    )
}
