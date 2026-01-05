export default function BannedPage() {
    return (
        <div className="section container" style={{ maxWidth: '600px', textAlign: 'center', marginTop: '10vh' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</h1>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>접근이 제한되었습니다</h1>
            <p style={{ fontSize: '1.1rem', color: '#888', lineHeight: '1.8', wordBreak: 'keep-all' }}>
                귀하의 계정은 커뮤니티 가이드라인 위반 또는 부적절한 활동으로 인해 이용이 정지되었습니다.<br />
                문의 사항이 있으시면 하단의 고객센터를 통해 연락주시기 바랍니다.
            </p>
            <div style={{ marginTop: '3rem' }}>
                <a href="/" className="btn btn-outline">홈으로 돌아가기</a>
            </div>
        </div>
    )
}
