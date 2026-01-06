-- 1. RLS(보안 규칙)를 아예 끕니다. (이게 문제인지 확인하기 위함)
alter table notices disable row level security;
alter table notice_comments disable row level security;

-- 2. 강제로 공지사항을 하나 더 넣습니다.
INSERT INTO notices (title, content, user_id)
VALUES (
  'RLS 해제 후 테스트 공지',
  '보안 규칙을 끄고 입력한 공지사항입니다. 이게 보인다면 보안 규칙(Policy) 문제였습니다.',
  (SELECT id FROM auth.users LIMIT 1)
);

-- 3. 현재 들어있는 모든 공지사항을 출력합니다.
-- 이 쿼리의 결과(Start running...)에 "Rows"가 몇 개 나오는지 확인해야 합니다.
SELECT * FROM notices;
