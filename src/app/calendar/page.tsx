import events from "@/data/events.json";

type Ev = { date: string; title: string; type: string; note?: string };

const typeLabel: Record<string, string> = {
  exam: "시험",
  holiday: "휴일",
  event: "행사",
};

export default function CalendarPage() {
  const sorted = [...(events as Ev[])].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--foam-light)]">학사 · 시험 달력</h1>
      <p className="text-sm text-[var(--text-muted)]">
        샘플 데이터입니다. <code className="rounded bg-black/30 px-1">src/data/events.json</code> 을 수정해 실제 일정을 반영하세요.
      </p>
      <ul className="space-y-3">
        {sorted.map((e) => (
          <li key={e.date + e.title} className="glass-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium text-[var(--text)]">{e.title}</p>
              {e.note && <p className="mt-1 text-sm text-[var(--text-muted)]">{e.note}</p>}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-[var(--foam)]/15 px-3 py-1 text-[var(--foam-light)]">
                {typeLabel[e.type] ?? e.type}
              </span>
              <span className="text-[var(--text-muted)]">{e.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
