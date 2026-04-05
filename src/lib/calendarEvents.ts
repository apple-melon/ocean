import type { SupabaseClient } from "@supabase/supabase-js";
import fallbackJson from "@/data/events.json";

export type CalendarEvent = {
  id: string;
  event_date: string;
  title: string;
  type: "exam" | "holiday" | "event" | "other";
  note: string | null;
};

type JsonEv = { date: string; title: string; type: string; note?: string };

function fromJson(): CalendarEvent[] {
  return (fallbackJson as JsonEv[]).map((e, i) => ({
    id: `json-${i}-${e.date}`,
    event_date: e.date,
    title: e.title,
    type: (["exam", "holiday", "event", "other"].includes(e.type) ? e.type : "event") as CalendarEvent["type"],
    note: e.note ?? null,
  }));
}

/** DB 우선, 실패 시 events.json */
export async function getCalendarEvents(
  supabase: SupabaseClient
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("id, event_date, title, type, note")
    .order("event_date", { ascending: true });

  if (error) {
    return fromJson();
  }

  return (data as CalendarEvent[]) ?? [];
}

export const typeLabel: Record<string, string> = {
  exam: "시험",
  holiday: "휴일",
  event: "행사",
  other: "기타",
};

export function typeColorClass(type: string): string {
  switch (type) {
    case "exam":
      return "bg-rose-500/80";
    case "holiday":
      return "bg-amber-400/90";
    case "event":
      return "bg-[var(--foam)]/90";
    default:
      return "bg-slate-400/80";
  }
}
