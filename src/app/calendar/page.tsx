import { createClient } from "@/lib/supabase/server";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { getCalendarEvents } from "@/lib/calendarEvents";
import Link from "next/link";

export const revalidate = 60;

export default async function CalendarPage() {
  const supabase = await createClient();
  const events = await getCalendarEvents(supabase);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foam-light)]">학사 · 시험 달력</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            날짜를 누르면 그날 일정 상세를 볼 수 있습니다. 일정은 관리자만 편집할 수 있습니다.
          </p>
        </div>
        <Link href="/" className="text-sm text-[var(--foam-light)] hover:underline">
          홈
        </Link>
      </div>

      <CalendarGrid events={events} />
    </div>
  );
}
