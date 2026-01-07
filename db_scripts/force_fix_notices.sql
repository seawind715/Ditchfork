-- ⚠️ WARNING: This will delete all existing notices and comments!
-- Use this to completely reset the Notice Board system if you are experiencing permission errors.

-- 1. Drop existing tables (CASCADE will remove dependent policies and comments)
DROP TABLE IF EXISTS notice_comments CASCADE;
DROP TABLE IF EXISTS notices CASCADE;

-- 2. Create notices table
create table notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create notice_comments table
create table notice_comments (
  id uuid default gen_random_uuid() primary key,
  notice_id uuid references notices(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS
alter table notices enable row level security;
alter table notice_comments enable row level security;

-- 5. Create Policies for notices (using case-insensitive email check)
create policy "Public_Notices_Select" on notices
  for select using (true);

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

-- 6. Create Policies for notice_comments
create policy "Public_NoticeComments_Select" on notice_comments
  for select using (true);

create policy "Authenticated_NoticeComments_Insert" on notice_comments
  for insert with check (auth.role() = 'authenticated');

create policy "Owner_Or_Admin_NoticeComments_Delete" on notice_comments
  for delete using (
    auth.uid() = user_id or
    lower(auth.jwt() ->> 'email') = 'id01035206992@gmail.com'
  );

-- 7. Grant access to public (for non-authenticated reads)
grant select on notices to anon, authenticated;
grant select on notice_comments to anon, authenticated;
grant insert, update, delete on notices to authenticated;
grant insert, update, delete on notice_comments to authenticated;
