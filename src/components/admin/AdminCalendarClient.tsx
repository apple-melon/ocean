"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEvent } from "@/lib/calendarEvents";
import { typeLabel } from "@/lib/calendarEvents";

const TYPES = ["exam", "holiday", "event", "other"] as const;

export function AdminCalendarClient() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({
    event_date: "",
    title: "",
    type: "event" as CalendarEvent["type"],
    note: "",
  });

  const supabase = createClient();

  const load = useCallback(async () => {
    setMsg(null);
    const { data, error } = await supabase
      .from("calendar_events")
      .select("id, event_date, title, type, note")
      .order("event_date", { ascending: true });
    if (error) {
      setMsg(error.message);
      setEvents([]);
    } else {
      setEvents((data as CalendarEvent[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  function startNew() {
    setEditing(null);
    setForm({ event_date: new Date().toISOString().slice(0, 10), title: "", type: "event", note: "" });
  }

  function startEdit(e: CalendarEvent) {
    setEditing(e);
    setForm({
      event_date: e.event_date,
      title: e.title,
      type: e.type,
      note: e.note ?? "",
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.title.trim()) {
      setMsg("제목을 입력하세요.");
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from("calendar_events")
        .update({
          event_date: form.event_date,
          title: form.title.trim(),
          type: form.type,
          note: form.note.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editing.id);
      if (error) setMsg(error.message);
      else {
        setEditing(null);
        setForm({ event_date: "", title: "", type: "event", note: "" });
        void load();
      }
    } else {
      const { error } = await supabase.from("calendar_events").insert({
        event_date: form.event_date,
        title: form.title.trim(),
        type: form.type,
        note: form.note.trim() || null,
      });
      if (error) setMsg(error.message);
      else {
        setForm({ event_date: new Date().toISOString().slice(0, 10), title: "", type: "event", note: "" });
        void load();
      }
    }
  }

  async function remove(id: string) {
    if (!confirm("이 일정을 삭제할까요?")) return;
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) setMsg(error.message);
    else void load();
  }

  if (loading) {
    return <p className="text-[var(--text-muted)]">불러오는 중...</p>;
  }

  return (
    <div className="space-y-8">
      {msg && <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-100">{msg}</p>}

      <form onSubmit={save} className="glass-card space-y-4 p-5">
        <h2 className="text-lg font-semibold text-[var(--foam-light)]">{editing ? "일정 수정" : "일정 추가"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-[var(--text-muted)]">날짜</label>
            <input
              className="input-ocean"
              type="date"
              required
              value={form.event_date}
              onChange={(x) => setForm((f) => ({ ...f, event_date: x.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[var(--text-muted)]">유형</label>
            <select
              className="input-ocean"
              value={form.type}
              onChange={(x) => setForm((f) => ({ ...f, type: x.target.value as CalendarEvent["type"] }))}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {typeLabel[t]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">제목</label>
          <input
            className="input-ocean"
            value={form.title}
            onChange={(x) => setForm((f) => ({ ...f, title: x.target.value }))}
            placeholder="중간고사 1일차"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--text-muted)]">메모 (선택)</label>
          <textarea className="input-ocean min-h-[88px]" value={form.note} onChange={(x) => setForm((f) => ({ ...f, note: x.target.value }))} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-ocean">
            {editing ? "저장" : "추가"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                startNew();
              }}
              className="rounded-lg border border-[var(--surface-border)] px-4 py-2 text-sm"
            >
              취소
            </button>
          )}
          {!editing && (
            <button type="button" onClick={startNew} className="text-sm text-[var(--text-muted)] hover:text-[var(--foam-light)]">
              폼 비우기
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-[var(--foam-light)]">전체 일정</h2>
        <ul className="space-y-2">
          {events.map((ev) => (
            <li key={ev.id} className="glass-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-[var(--text)]">{ev.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {ev.event_date} · {typeLabel[ev.type] ?? ev.type}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(ev)} className="rounded-lg border border-[var(--surface-border)] px-3 py-1 text-sm">
                  수정
                </button>
                <button type="button" onClick={() => remove(ev.id)} className="rounded-lg border border-red-400/40 px-3 py-1 text-sm text-red-200">
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
        {events.length === 0 && <p className="text-sm text-[var(--text-muted)]">등록된 일정이 없습니다.</p>}
      </div>
    </div>
  );
}
