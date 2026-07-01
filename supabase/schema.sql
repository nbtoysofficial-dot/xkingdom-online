-- ============================================================
-- X Kingdom Online — Supabase schema
-- รันไฟล์นี้ใน Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ตารางเก็บสถานะเกมกลาง (1 แถว = 1 ห้อง)
create table if not exists public.games (
  code          text primary key,                 -- รหัสห้อง 4 ตัว
  status        text not null default 'waiting',   -- waiting | playing | over
  player_a      uuid,                              -- auth uid ของผู้สร้างห้อง
  player_b      uuid,                              -- auth uid ของผู้เข้าห้อง
  player_a_name text default 'ผู้เล่น 1',
  player_b_name text default 'ผู้เล่น 2',
  turn          text default 'A',                  -- 'A' | 'B'
  state         jsonb not null default '{}'::jsonb,-- สถานะเกมทั้งหมด (กระดาน/มือ/มานา ฯลฯ)
  winner        text,                              -- 'A' | 'B' | null
  version       int  not null default 1,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- อัปเดต updated_at อัตโนมัติ
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists games_touch on public.games;
create trigger games_touch before update on public.games
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Row Level Security
-- ผู้เล่นล็อกอินแบบ anonymous (แต่ละเครื่องได้ uid ของตัวเอง)
-- ============================================================
alter table public.games enable row level security;

-- อ่านได้ทุกคนที่ล็อกอิน (จำเป็นตอนหา/เข้าห้อง)
drop policy if exists "read games" on public.games;
create policy "read games" on public.games
  for select to authenticated using (true);

-- สร้างห้อง: ต้องตั้ง player_a เป็น uid ของตัวเอง
drop policy if exists "create game" on public.games;
create policy "create game" on public.games
  for insert to authenticated
  with check (player_a = auth.uid());

-- แก้ไข: ผู้เล่นสองคนในห้องเท่านั้น (หรือตอนเข้าห้องที่ยังว่าง)
drop policy if exists "update game" on public.games;
create policy "update game" on public.games
  for update to authenticated
  using  (auth.uid() = player_a or auth.uid() = player_b or player_b is null)
  with check (auth.uid() = player_a or auth.uid() = player_b);

-- ============================================================
-- เปิด Realtime ให้ตารางนี้ (ทำให้ทั้งสองเครื่องได้รับ push ทันที)
-- ============================================================
alter publication supabase_realtime add table public.games;

-- (ไม่บังคับ) ลบห้องเก่าที่ค้างเกิน 1 วันด้วย cron ก็ได้ภายหลัง
