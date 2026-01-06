-- 1. 다시 보안 장치(RLS)를 켭니다. (해킹 방지)
alter table notices enable row level security;
alter table notice_comments enable row level security;

-- 2. 기존의 골치 아픈 정책들을 모두 삭제합니다.
drop policy if exists "Public_Notices_Select" on notices;
drop policy if exists "Admin_Notices_Insert" on notices;
drop policy if exists "Admin_Notices_Update" on notices;
drop policy if exists "Admin_Notices_Delete" on notices;
drop policy if exists "Temporary_Open_Insert" on notices; -- 아까 만든 임시 정책도 삭제

-- 3. [읽기] 누구나 볼 수 있게 허용
create policy "Public_Notices_Select" on notices
  for select using (true);

-- 4. [쓰기/수정/삭제] 관리자 이메일을 가진 사람의 '고유 ID(UUID)'를 찾아서 그 사람만 허용
-- (이메일 텍스트 비교보다 훨씬 확실하고 안전한 방법입니다)
create policy "Admin_Actions_Notices" on notices
  for all using (
    auth.uid() in (select id from auth.users where email = 'id01035206992@gmail.com')
  );

-- 5. 댓글 정책 재설정
drop policy if exists "Public_NoticeComments_Select" on notice_comments;
create policy "Public_NoticeComments_Select" on notice_comments for select using (true);

drop policy if exists "Authenticated_NoticeComments_Insert" on notice_comments;
create policy "Authenticated_NoticeComments_Insert" on notice_comments for insert with check (auth.role() = 'authenticated');

drop policy if exists "Owner_Or_Admin_NoticeComments_Delete" on notice_comments;
create policy "Owner_Or_Admin_NoticeComments_Delete" on notice_comments for delete using (
    auth.uid() = user_id or
    auth.uid() in (select id from auth.users where email = 'id01035206992@gmail.com')
);

-- 6. 테스트용으로 만들었던 글들을 깔끔하게 삭제하고 싶으시면 아래 줄의 주석(--)을 풀고 실행하세요.
-- delete from notices where title like '%테스트%';
