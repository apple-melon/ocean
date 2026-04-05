/** 한국(서울) 달력 기준 날짜·요일 (Vercel UTC 서버에서도 동일) */

export function seoulYmd(clock: Date = new Date()): { y: number; m: number; d: number } {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(clock);
  const [y, m, d] = s.split("-").map(Number);
  return { y, m, d };
}

function civilWeekday(y: number, m: number, d: number): number {
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
}

/** 해당 서울 날짜가 속한 주의 월요일 (서울 달력) */
export function mondayOfSeoulWeek(clock: Date = new Date()): { y: number; m: number; d: number } {
  const { y, m, d } = seoulYmd(clock);
  const wd = civilWeekday(y, m, d);
  const add = wd === 0 ? -6 : 1 - wd;
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + add);
  return {
    y: base.getUTCFullYear(),
    m: base.getUTCMonth() + 1,
    d: base.getUTCDate(),
  };
}

export function ymdPartsToIso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function addDaysYmd(y: number, m: number, d: number, delta: number): { y: number; m: number; d: number } {
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + delta);
  return {
    y: base.getUTCFullYear(),
    m: base.getUTCMonth() + 1,
    d: base.getUTCDate(),
  };
}
