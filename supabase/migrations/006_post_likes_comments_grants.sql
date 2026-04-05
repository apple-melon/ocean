-- 좋아요·댓글 테이블에 authenticated(로그인 JWT) 역할 권한 보강
-- 003으로 post_likes / post_comments 가 생성된 뒤 실행하세요.

grant select, insert, delete on public.post_likes to authenticated;
grant select, insert, delete on public.post_comments to authenticated;
