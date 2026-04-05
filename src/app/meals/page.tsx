import staticData from "@/data/meals.json";
import { fetchNeisWeekdayMeals, neisConfigured } from "@/lib/neisMeals";

type Day = { date: string; lunch: string };

export const revalidate = 3600;

export default async function MealsPage() {
  let weekOf: string;
  let days: Day[];
  let source: "neis" | "static";

  if (neisConfigured()) {
    try {
      const live = await fetchNeisWeekdayMeals(new Date());
      weekOf = live.weekOf;
      days = live.days;
      source = "neis";
    } catch {
      const s = staticData as { weekOf: string; days: Day[] };
      weekOf = s.weekOf;
      days = s.days;
      source = "static";
    }
  } else {
    const s = staticData as { weekOf: string; days: Day[] };
    weekOf = s.weekOf;
    days = s.days;
    source = "static";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--foam-light)]">급식</h1>
      <p className="text-sm text-[var(--text-muted)]">
        {source === "neis" ? (
          <>
            <strong className="text-[var(--foam-light)]">NEIS</strong>에서 이번 주(서울 기준 월~금) 중식 메뉴를 불러왔습니다. 기준 주 시작(월요일):{" "}
            {weekOf}
          </>
        ) : (
          <>
            샘플 데이터입니다. NEIS 연동을 쓰려면 환경 변수{" "}
            <code className="rounded bg-black/30 px-1">NEIS_API_KEY</code>,{" "}
            <code className="rounded bg-black/30 px-1">NEIS_ATPT_OFCDC_SC_CODE</code>,{" "}
            <code className="rounded bg-black/30 px-1">NEIS_SD_SCHUL_CODE</code> 를 설정한 뒤 배포하세요. (
            <code className="rounded bg-black/30 px-1">src/data/meals.json</code> 기준 주: {weekOf})
          </>
        )}
      </p>
      <ul className="space-y-3">
        {days.map((d) => (
          <li key={d.date} className="glass-card p-4">
            <p className="mb-2 text-sm font-medium text-[var(--foam)]">{d.date}</p>
            <p className="whitespace-pre-wrap text-[var(--text)]">{d.lunch}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
