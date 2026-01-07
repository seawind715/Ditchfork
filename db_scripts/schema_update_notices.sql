-- Create notices table
create table if not exists notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notice_comments table
create table if not exists notice_comments (
  id uuid default gen_random_uuid() primary key,
  notice_id uuid references notices(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table notices enable row level security;
alter table notice_comments enable row level security;

-- Policies for notices
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

-- Policies for notice_comments
create policy "Public_NoticeComments_Select" on notice_comments
  for select using (true);

create policy "Authenticated_NoticeComments_Insert" on notice_comments
  for insert with check (auth.role() = 'authenticated');

create policy "Owner_Or_Admin_NoticeComments_Delete" on notice_comments
  for delete using (
    auth.uid() = user_id or
    auth.jwt() ->> 'email' = 'id01035206992@gmail.com'
  );

-- Add some initial dummy data for testing (optional, but helpful)
-- insert into notices (title, content, user_id) values ('Welcome to Ditchfork', 'This is the first notice.', (select id from auth.users limit 1));
