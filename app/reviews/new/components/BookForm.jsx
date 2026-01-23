import React from 'react'

const KDC_CLASSES = [
    "총류", "철학", "종교", "사회과학", "자연과학",
    "기술과학", "예술", "언어", "문학", "역사"
]

/**
 * 도서 리뷰 작성을 위한 폼 컴포넌트
 * @param {Object} props
 * @param {string} props.bookTitle - 책 제목
 * @param {Function} props.setBookTitle - 책 제목 설정 함수
 * @param {string} props.bookAuthor - 작가 이름
 * @param {Function} props.setBookAuthor - 작가 이름 설정 함수
 * @param {string} props.kdcClass - KDC 대분류
 * @param {Function} props.setKdcClass - KDC 설정 함수
 * @param {string} props.specificGenre - 세부 장르 (직접 입력)
 * @param {Function} props.setSpecificGenre - 세부 장르 설정 함수
 */
export default function BookForm({
    bookTitle, setBookTitle,
    bookAuthor, setBookAuthor,
    kdcClass, setKdcClass,
    specificGenre, setSpecificGenre
}) {
    return (
        <>
            <div className="grid grid-cols-2" style={{ gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                    <label>책 제목 *</label>
                    <input
                        value={bookTitle}
                        onChange={e => setBookTitle(e.target.value)}
                        placeholder="예: 채식주의자 (한글 입력)"
                        required
                    />
                </div>
                <div>
                    <label>작가 *</label>
                    <input
                        value={bookAuthor}
                        onChange={e => setBookAuthor(e.target.value)}
                        placeholder="예: 한강 (한글 입력)"
                        required
                    />
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
                    <input
                        value={specificGenre}
                        onChange={e => setSpecificGenre(e.target.value)}
                        placeholder="예: 현대소설"
                    />
                </div>
            </div>
        </>
    )
}
