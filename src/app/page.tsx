import { createClient } from "@/lib/supabase/server";
import { getCalendarEvents } from "@/lib/calendarEvents";
import { HomeClient, type UpcomingItem } from "./HomeClient";

export const revalidate = 60;

export default async function Page() {
  const supabase = await createClient();
  const events = await getCalendarEvents(supabase);
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const upcoming: UpcomingItem[] = events
    .filter((e) => new Date(e.event_date) >= start)
    .sort((a, b) => a.event_date.localeCompare(b.event_date) || a.title.localeCompare(b.title))
    .slice(0, 3)
    .map((e) => ({ key: e.id, date: e.event_date, title: e.title }));

  return <HomeClient upcoming={upcoming} />;
}
