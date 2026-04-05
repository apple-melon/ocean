-- 비관리자는 자신의 banned / ban_reason 을 변경할 수 없게 함 (프로필 폼 악용 방지)
CREATE OR REPLACE FUNCTION public.enforce_profiles_ban_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF auth.uid() = NEW.id AND NOT public.is_admin() THEN
      NEW.banned := OLD.banned;
      NEW.ban_reason := OLD.ban_reason;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

drop trigger if exists profiles_enforce_ban on public.profiles;
create trigger profiles_enforce_ban
  before update on public.profiles
  for each row execute function public.enforce_profiles_ban_columns();
