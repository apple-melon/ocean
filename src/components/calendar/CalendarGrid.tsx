"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CalendarEvent } from "@/lib/calendarEvents";
import { typeColorClass, typeLabel } from "@/lib/calendarEvents";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function iso(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function buildMonthGrid(year: number, month: number): { day: number; inMonth: boolean; iso: string }[][] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthLast = new Date(year, month - 1, 0).getDate();
  const cells: { day: number; inMonth: boolean; iso: string }[] = [];

  for (let i = 0; i < firstWeekday; i++) {
    const day = prevMonthLast - firstWeekday + i + 1;
    const dt = new Date(year, month - 2, day);
    cells.push({
      day,
      inMonth: false,
      iso: iso(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()),
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, iso: iso(year, month, d) });
  }

  const cursor = new Date(year, month - 1, daysInMonth);
  cursor.setDate(cursor.getDate() + 1);
  while (cells.length % 7 !== 0) {
    cells.push({
      day: cursor.getDate(),
      inMonth: false,
      iso: iso(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate()),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const rows: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export function CalendarGrid({ events }: { events: CalendarEvent[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const list = m.get(e.event_date) ?? [];
      list.push(e);
      m.set(e.event_date, list);
    }
    return m;
  }, [events]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const todayIso = iso(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const selectedEvents = selectedIso ? (byDate.get(selectedIso) ?? []) : [];

  function prevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[var(--foam-light)]">
          {year}년 {month}월
        </h2>
        <div className="flex gap-2">
          <button type="button" onClick={prevMonth} className="rounded-lg border border-[var(--surface-border)] px-3 py-1.5 text-sm hover:bg-white/5">
            이전
          </button>
          <button
            type="button"
            onClick={() => {
              const n = new Date();
              setYear(n.getFullYear());
              setMonth(n.getMonth() + 1);
            }}
            className="rounded-lg border border-[var(--surface-border)] px-3 py-1.5 text-sm hover:bg-white/5"
          >
            오늘
          </button>
          <button type="button" onClick={nextMonth} className="rounded-lg border border-[var(--surface-border)] px-3 py-1.5 text-sm hover:bg-white/5">
            다음
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden p-2 sm:p-4">
        <div className="grid grid-cols-7 gap-px rounded-lg bg-[var(--surface-border)] text-center text-xs font-medium text-[var(--text-muted)] sm:text-sm">
          {WEEKDAYS.map((w) => (
            <div key={w} className="bg-[var(--ocean-deep)]/90 py-2">
              {w}
            </div>
          ))}
        </div>
        <div className="mt-px grid grid-cols-7 gap-px rounded-lg bg-[var(--surface-border)]">
          {grid.flatMap((row, ri) =>
            row.map((cell, ci) => {
              const dayEvents = byDate.get(cell.iso) ?? [];
              const isToday = cell.iso === todayIso;
              return (
                <button
                  key={`${ri}-${ci}-${cell.iso}`}
                  type="button"
                  onClick={() => setSelectedIso(cell.iso)}
                  className={`min-h-[4.5rem] bg-[var(--ocean-deep)]/80 p-1 text-left transition-colors hover:bg-white/5 sm:min-h-[5.5rem] sm:p-2 ${
                    !cell.inMonth ? "opacity-40" : ""
                  } ${isToday ? "ring-1 ring-inset ring-[var(--foam)]" : ""}`}
                >
                  <span className={`text-sm font-medium ${isToday ? "text-[var(--foam-light)]" : "text-[var(--text)]"}`}>
                    {cell.day}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className={`block h-1.5 w-1.5 shrink-0 rounded-full ${typeColorClass(ev.type)}`}
                        title={ev.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-[var(--text-muted)]">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
        {(["exam", "holiday", "event", "other"] as const).map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${typeColorClass(t)}`} />
            {typeLabel[t]}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {selectedIso && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cal-modal-title"
            onClick={() => setSelectedIso(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="glass-card max-h-[70vh] w-full max-w-md overflow-y-auto p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-2">
                <h3 id="cal-modal-title" className="text-lg font-semibold text-[var(--foam-light)]">
                  {selectedIso.replace(/-/g, ". ")}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedIso(null)}
                  className="rounded-lg px-2 py-1 text-sm text-[var(--text-muted)] hover:bg-white/10"
                >
                  닫기
                </button>
              </div>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">이 날짜에 등록된 일정이 없습니다.</p>
              ) : (
                <ul className="space-y-4">
                  {selectedEvents.map((ev) => (
                    <li key={ev.id} className="border-b border-[var(--surface-border)] pb-4 last:border-0 last:pb-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs text-[var(--ocean-deep)] ${typeColorClass(ev.type)}`}>
                          {typeLabel[ev.type] ?? ev.type}
                        </span>
                        <span className="font-medium text-[var(--text)]">{ev.title}</span>
                      </div>
                      {ev.note && <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{ev.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
