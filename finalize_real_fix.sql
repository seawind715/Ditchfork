-- 1. 다시 보안 장치(RLS)를 켭니다.
alter table notices enable row level security;
alter table notice_comments enable row level security;

-- 2. 오류를 일으켰던 모든 정책을 깔끔하게 삭제합니다.
drop policy if exists "Public_Notices_Select" on notices;
drop policy if exists "Admin_Notices_Insert" on notices;
drop policy if exists "Admin_Notices_Update" on notices;
drop policy if exists "Admin_Notices_Delete" on notices;
drop policy if exists "Temporary_Open_Insert" on notices;
drop policy if exists "Temporary_Open_Update" on notices;
drop policy if exists "Temporary_Open_Delete" on notices;
drop policy if exists "Admin_Actions_Notices" on notices; -- 삭제: permission denied 원인

-- 3. [읽기] 누구나 볼 수 있게 허용
create policy "Public_Notices_Select" on notices
  for select using (true);

-- 4. [쓰기/수정/삭제] JWT 토큰(로그인 정보)에서 이메일을 직접 확인
-- (이 방식은 auth.users 테이블을 조회하지 않아 권한 오류가 없습니다)
create policy "Admin_Notices_Insert" on notices
  for insert with check (
    lower(auth.jwt() ->> 'email') = 'id01035206992@gmail.com'
  );

create policy "Admin_Notices_Update" on notices
  for update using (
    lower(auth.jwt() ->> 'email') = 'id01035206992@gmail.com'
  );

create policy "Admin_Notices_Delete" on notices
  for delete using (
    lower(auth.jwt() ->> 'email') = 'id01035206992@gmail.com'
  );

-- 5. 댓글 정책 재설정 (표준)
drop policy if exists "Public_NoticeComments_Select" on notice_comments;
create policy "Public_NoticeComments_Select" on notice_comments for select using (true);

drop policy if exists "Authenticated_NoticeComments_Insert" on notice_comments;
create policy "Authenticated_NoticeComments_Insert" on notice_comments for insert with check (auth.role() = 'authenticated');

drop policy if exists "Owner_Or_Admin_NoticeComments_Delete" on notice_comments;
create policy "Owner_Or_Admin_NoticeComments_Delete" on notice_comments for delete using (
    auth.uid() = user_id or
    lower(auth.jwt() ->> 'email') = 'id01035206992@gmail.com'
);
