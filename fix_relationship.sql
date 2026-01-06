-- 🔗 연결고리 연결 (Foreign Key)
-- API가 'notices'와 'profiles' 테이블이 서로 연결된 것인지 알 수 있게 명찰을 붙여주는 작업입니다.
-- 이 작업이 없으면 "작성자 정보(profiles)"를 가져오는 쿼리가 실패해서 목록이 안 뜰 수 있습니다.

-- 1. notices 테이블이 profiles 테이블을 바라보게 설정
ALTER TABLE notices
ADD CONSTRAINT fk_notices_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- 2. notice_comments 테이블도 profiles 테이블을 바라보게 설정
ALTER TABLE notice_comments
ADD CONSTRAINT fk_notice_comments_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;
