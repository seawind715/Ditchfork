-- Drop existing policies to ensure clean slate (and avoid "already exists" errors)
drop policy if exists "Public_Notices_Select" on notices;
drop policy if exists "Admin_Notices_Insert" on notices;
drop policy if exists "Admin_Notices_Update" on notices;
drop policy if exists "Admin_Notices_Delete" on notices;

drop policy if exists "Public_NoticeComments_Select" on notice_comments;
drop policy if exists "Authenticated_NoticeComments_Insert" on notice_comments;
drop policy if exists "Owner_Or_Admin_NoticeComments_Delete" on notice_comments;

-- Re-enable RLS (just in case)
alter table notices enable row level security;
alter table notice_comments enable row level security;

-- Re-create Policies for notices
create policy "Public_Notices_Select" on notices
  for select using (true);

create policy "Admin_Notices_Insert" on notices
  for insert with check (
    auth.jwt() ->> 'email' = 'id01035206992@gmail.com'
  );

create policy "Admin_Notices_Update" on notices
  for update using (
    auth.jwt() ->> 'email' = 'id01035206992@gmail.com'
  );

create policy "Admin_Notices_Delete" on notices
  for delete using (
    auth.jwt() ->> 'email' = 'id01035206992@gmail.com'
  );

-- Re-create Policies for notice_comments
create policy "Public_NoticeComments_Select" on notice_comments
  for select using (true);

create policy "Authenticated_NoticeComments_Insert" on notice_comments
  for insert with check (auth.role() = 'authenticated');

create policy "Owner_Or_Admin_NoticeComments_Delete" on notice_comments
  for delete using (
    auth.uid() = user_id or
    auth.jwt() ->> 'email' = 'id01035206992@gmail.com'
  );
