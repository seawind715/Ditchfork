-- 🚨 EMERGENCY FIX: Temporarily allow ANY logged-in user to post notices
-- This is to verify if the specific email check was causing the block.

-- 1. Drop the strict Admin policy
drop policy if exists "Admin_Notices_Insert" on notices;
drop policy if exists "Admin_Notices_Update" on notices;
drop policy if exists "Admin_Notices_Delete" on notices;

-- 2. Create a Permissive Policy (Allow ANY authenticated user)
create policy "Temporary_Open_Insert" on notices
  for insert with check (auth.role() = 'authenticated');

create policy "Temporary_Open_Update" on notices
  for update using (auth.role() = 'authenticated');

create policy "Temporary_Open_Delete" on notices
  for delete using (auth.role() = 'authenticated');

-- 3. Ensure Select is public
drop policy if exists "Public_Notices_Select" on notices;
create policy "Public_Notices_Select" on notices for select using (true);
