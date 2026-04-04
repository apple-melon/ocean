import data from "@/data/meals.json";

type Day = { date: string; lunch: string };

export default function MealsPage() {
  const { weekOf, days } = data as { weekOf: string; days: Day[] };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--foam-light)]">급식</h1>
      <p className="text-sm text-[var(--text-muted)]">
        기준 주: {weekOf}. <code className="rounded bg-black/30 px-1">src/data/meals.json</code> 에서 수정하거나 나중에 NEIS 연동을 추가할 수 있습니다.
      </p>
      <ul className="space-y-3">
        {days.map((d) => (
          <li key={d.date} className="glass-card p-4">
            <p className="mb-2 text-sm font-medium text-[var(--foam)]">{d.date}</p>
            <p className="text-[var(--text)]">{d.lunch}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
