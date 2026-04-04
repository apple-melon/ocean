"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Task = { id: string; title: string; due: string; done: boolean };

const KEY = "ocean-ms-homework-tasks";

export default function HomeworkPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const boot = useRef(true);

  useEffect(() => {
    if (boot.current) {
      boot.current = false;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) queueMicrotask(() => setTasks(JSON.parse(raw)));
      } catch {
        /* ignore */
      }
      return;
    }
    localStorage.setItem(KEY, JSON.stringify(tasks));
  }, [tasks]);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks((t) => [
      ...t,
      { id: crypto.randomUUID(), title: title.trim(), due: due || "", done: false },
    ]);
    setTitle("");
    setDue("");
  }

  function toggle(id: string) {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  }

  function remove(id: string) {
    setTasks((t) => t.filter((x) => x.id !== id));
  }

  const sorted = [...tasks].sort((a, b) => {
    if (a.due && b.due) return a.due.localeCompare(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    return 0;
  });

  const doneBtn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ";
  const doneOn = "border-[var(--foam)] bg-[var(--foam)]/20 text-[var(--foam-light)]";
  const doneOff = "border-[var(--surface-border)]";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--foam-light)]">과제 체크</h1>
      <p className="text-sm text-[var(--text-muted)]">
        이 기기 브라우저에만 저장됩니다. 다른 기기와 동기화하려면 이후 계정 연동을 추가할 수 있습니다.
      </p>

      <form onSubmit={add} className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-[var(--text-muted)]">할 일</label>
          <input className="input-ocean" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="수학 숙제" />
        </div>
        <div className="sm:w-40">
          <label className="mb-1 block text-sm text-[var(--text-muted)]">마감(선택)</label>
          <input className="input-ocean" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <button type="submit" className="btn-ocean shrink-0">
          추가
        </button>
      </form>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {sorted.map((task) => (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card flex flex-wrap items-center gap-3 p-4"
            >
              <button
                type="button"
                onClick={() => toggle(task.id)}
                className={doneBtn + (task.done ? doneOn : doneOff)}
                aria-label={task.done ? "완료 취소" : "완료"}
              >
                {task.done ? "✓" : ""}
              </button>
              <div className="min-w-0 flex-1">
                <p className={task.done ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]"}>{task.title}</p>
                {task.due && <p className="text-xs text-[var(--text-muted)]">마감 {task.due}</p>}
              </div>
              <button type="button" onClick={() => remove(task.id)} className="text-sm text-red-300/90 hover:underline">
                삭제
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}