import { addDaysYmd, mondayOfSeoulWeek, ymdPartsToIso } from "@/lib/seoulDate";

export type MealEntry = { date: string; lunch: string };

function toNeisYmd(y: number, m: number, d: number): string {
  return `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
}

/** NEIS 메뉴 문자열: <br/> 구분·태그 정리 */
export function formatNeisDish(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(", ");
}

function rowsFromMealInfo(json: Record<string, unknown>): Record<string, string>[] {
  const info = json.mealServiceDietInfo;
  if (!info || !Array.isArray(info)) return [];
  for (const block of info) {
    if (block && typeof block === "object" && "row" in block) {
      const row = (block as { row: unknown }).row;
      if (Array.isArray(row)) return row as Record<string, string>[];
      if (row && typeof row === "object") return [row as Record<string, string>];
    }
  }
  return [];
}

export function neisConfigured(): boolean {
  return Boolean(
    process.env.NEIS_API_KEY?.trim() &&
      process.env.NEIS_ATPT_OFCDC_SC_CODE?.trim() &&
      process.env.NEIS_SD_SCHUL_CODE?.trim()
  );
}

/**
 * NEIS 급식식단정보 (중식 기본). 공공데이터포털에서 발급한 KEY 필요.
 * https://open.neis.go.kr/portal/guide/apiGuidePage.do
 */
export async function fetchNeisMealForDay(
  y: number,
  m: number,
  d: number,
  init?: RequestInit
): Promise<MealEntry> {
  const key = process.env.NEIS_API_KEY?.trim();
  const atpt = process.env.NEIS_ATPT_OFCDC_SC_CODE?.trim();
  const sch = process.env.NEIS_SD_SCHUL_CODE?.trim();
  const mealCode = (process.env.NEIS_MMEAL_SC_CODE ?? "2").trim();

  if (!key || !atpt || !sch) {
    throw new Error("NEIS 환경 변수가 없습니다.");
  }

  const ymd = toNeisYmd(y, m, d);
  const url = new URL("https://open.neis.go.kr/hub/mealServiceDietInfo");
  url.searchParams.set("KEY", key);
  url.searchParams.set("Type", "json");
  url.searchParams.set("pIndex", "1");
  url.searchParams.set("pSize", "10");
  url.searchParams.set("ATPT_OFCDC_SC_CODE", atpt);
  url.searchParams.set("SD_SCHUL_CODE", sch);
  url.searchParams.set("MMEAL_SC_CODE", mealCode);
  url.searchParams.set("MLSV_YMD", ymd);

  const res = await fetch(url.toString(), {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });

  const text = await res.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("NEIS 응답이 JSON이 아닙니다.");
  }

  if (json.RESULT) {
    const R = json.RESULT as Record<string, string>;
    const code = R.CODE;
    if (code === "INFO-200") {
      return { date: ymdPartsToIso(y, m, d), lunch: "(급식 없음)" };
    }
    if (code && code !== "INFO-000") {
      throw new Error(R.MESSAGE ?? code);
    }
  }

  const rows = rowsFromMealInfo(json);
  const iso = ymdPartsToIso(y, m, d);

  if (rows.length === 0) {
    return { date: iso, lunch: "(급식 없음)" };
  }

  const combined = rows
    .map((r) => r.DDISH_NM)
    .filter(Boolean)
    .join(" / ");
  const lunch = formatNeisDish(combined) || "(메뉴 없음)";
  return { date: iso, lunch };
}

/** 서울 기준 이번 주 월~금 급식 */
export async function fetchNeisWeekdayMeals(clock: Date = new Date()): Promise<{
  weekOf: string;
  days: MealEntry[];
}> {
  const mon = mondayOfSeoulWeek(clock);
  const weekOf = ymdPartsToIso(mon.y, mon.m, mon.d);
  const cacheInit = { next: { revalidate: 3600 } } as RequestInit;

  const days = await Promise.all(
    [0, 1, 2, 3, 4].map(async (i) => {
      const { y, m, d } = addDaysYmd(mon.y, mon.m, mon.d, i);
      try {
        return await fetchNeisMealForDay(y, m, d, cacheInit);
      } catch {
        return {
          date: ymdPartsToIso(y, m, d),
          lunch: "(불러오기 실패 — KEY·학교코드·네트워크를 확인하세요)",
        };
      }
    })
  );

  return { weekOf, days };
}
