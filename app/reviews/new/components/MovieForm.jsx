import React from 'react'

/**
 * 영화 리뷰 작성을 위한 폼 컴포넌트
 * @param {Object} props
 * @param {string} props.movieTitle - 영화 제목 (검색용)
 * @param {Function} props.setMovieTitle - 제목 설정 함수
 * @param {Function} props.handleSearchMovie - TMDB 검색 함수
 * @param {boolean} props.isFetchingCover - 검색 중 여부
 * @param {Array} props.movieSearchResults - 검색 결과 배열
 * @param {Object} props.selectedMovie - 선택된 영화 객체
 * @param {Function} props.handleSelectMovie - 영화 선택 핸들러
 * @param {Function} props.getPosterUrl - 포스터 URL 생성 함수
 * @param {string} props.year - 개봉 연도
 * @param {string} props.movieDirector - 감독 이름
 * @param {string} props.currentMovieGenre - 현재 입력 중인 장르 태그
 * @param {Function} props.setCurrentMovieGenre - 장르 입력함수
 * @param {Array} props.movieGenres - 추가된 장르 리스트
 * @param {Function} props.handleAddMovieGenre - 장르 추가 핸들러
 * @param {Function} props.handleRemoveMovieGenre - 장르 삭제 핸들러
 */
export default function MovieForm({
    movieTitle, setMovieTitle, handleSearchMovie, isFetchingCover,
    movieSearchResults, selectedMovie, handleSelectMovie, getPosterUrl,
    year, movieDirector,
    currentMovieGenre, setCurrentMovieGenre, movieGenres,
    handleAddMovieGenre, handleRemoveMovieGenre
}) {
    return (
        <>
            <div style={{ background: '#1a1a1a', padding: '1.5rem', border: '1px solid #333' }}>
                <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>영화 검색 (제목만 입력해주세요)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        placeholder="예: 기생충 (감독명 제외)"
                        value={movieTitle}
                        onChange={e => setMovieTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchMovie())}
                        style={{ marginBottom: 0 }}
                    />
                    <button type="button" onClick={handleSearchMovie} className="btn btn-outline" disabled={isFetchingCover}>
                        {isFetchingCover ? '검색 중...' : '검색'}
                    </button>
                </div>
                {/* 검색 결과 표시 */}
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
                    <img src={getPosterUrl(selectedMovie.poster_path)} style={{ width: '150px' }} alt="Poster" />
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
                    <input
                        value={currentMovieGenre}
                        onChange={e => setCurrentMovieGenre(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddMovieGenre(e))}
                        placeholder="예: Sci-Fi, Thriller"
                        style={{ width: '200px' }}
                    />
                    <button type="button" onClick={handleAddMovieGenre} className="btn btn-outline">추가</button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {movieGenres.map(g => (
                        <span key={g} style={{ background: 'var(--accent)', color: 'black', padding: '0.2rem 0.6rem', fontSize: '0.85rem' }}>
                            {g} <button type="button" onClick={() => handleRemoveMovieGenre(g)} style={{ border: 'none', background: 'none', color: 'black' }}>&times;</button>
                        </span>
                    ))}
                </div>
            </div>
        </>
    )
}
