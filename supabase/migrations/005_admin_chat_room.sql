-- 운영자 전용 채팅방: 목록·메시지 조회·전송은 admin 역할만 (일반 사용자는 방 자체가 안 보임)
-- 선행: 003_board_ban_calendar_likes.sql 적용됨(is_banned 사용). 미적용 시 chat_messages_insert 정책에서 오류 날 수 있음.
insert into public.chat_rooms (id, name) values ('admin', '운영자 전용')
on conflict (id) do nothing;

drop policy if exists "chat_rooms_select" on public.chat_rooms;
create policy "chat_rooms_select" on public.chat_rooms for select
  using (
    auth.uid() is not null
    and (id <> 'admin' or public.is_admin())
  );

drop policy if exists "chat_messages_select" on public.chat_messages;
create policy "chat_messages_select" on public.chat_messages for select
  using (
    auth.uid() is not null
    and (
      room_id <> 'admin'
      or public.is_admin()
    )
  );

-- 003의 밴 검사 + 운영자 방 전송 제한
drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages for insert
  with check (
    auth.uid() = user_id
    and not public.is_banned(auth.uid())
    and (
      room_id <> 'admin'
      or public.is_admin()
    )
  );
