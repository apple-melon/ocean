-- 학사 달력 일정 (공개 조회, 어드민만 편집)

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  title text not null,
  type text not null default 'event' check (type in ('exam', 'holiday', 'event', 'other')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index calendar_events_date_idx on public.calendar_events (event_date);

alter table public.calendar_events enable row level security;

create policy "calendar_events_select"
  on public.calendar_events for select
  using (true);

create policy "calendar_events_insert"
  on public.calendar_events for insert
  with check (public.is_admin());

create policy "calendar_events_update"
  on public.calendar_events for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "calendar_events_delete"
  on public.calendar_events for delete
  using (public.is_admin());

-- 샘플 (테이블이 비어 있을 때만 실행하려면 수동으로 넣거나, 중복이 괜찮으면 그대로 실행)
insert into public.calendar_events (event_date, title, type, note) values
  ('2026-04-04', '개학 후 안내', 'event', '샘플 — 관리에서 수정하세요'),
  ('2026-04-15', '중간고사 시작(예시)', 'exam', '실제 일정으로 바꾸세요'),
  ('2026-05-05', '어린이날', 'holiday', null);
