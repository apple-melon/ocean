"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Room = { id: string; name: string };
type Msg = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
};

type MsgView = Msg & { display_name: string };

export default function ChatPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("general");
  const [messages, setMessages] = useState<MsgView[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [mobileThread, setMobileThread] = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | "unsupported">("default");
  const bottomRef = useRef<HTMLDivElement>(null);
  const myIdRef = useRef<string | null>(null);
  const roomsRef = useRef<Room[]>([]);

  const supabase = useMemo(() => createClient(), []);

  const nameCache = useRef<Map<string, string>>(new Map());

  const resolveNames = useCallback(
    async (msgs: Msg[]): Promise<MsgView[]> => {
      const missing = msgs
        .map((m) => m.user_id)
        .filter((id) => id && !nameCache.current.has(id));
      const uniq = [...new Set(missing)];
      if (uniq.length > 0) {
        const { data } = await supabase.from("profiles").select("id, display_name").in("id", uniq);
        for (const p of data ?? []) {
          nameCache.current.set(p.id, p.display_name ?? "학생");
        }
      }
      return msgs.map((m) => ({
        ...m,
        display_name: nameCache.current.get(m.user_id) ?? "학생",
      }));
    },
    [supabase]
  );

  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifStatus(Notification.permission);
    } else {
      setNotifStatus("unsupported");
    }
  }, []);

  async function requestNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setNotifStatus(p);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      if (cancelled) return;
      setMyId(user.id);
      setAuthed(true);
      const { data: r } = await supabase.from("chat_rooms").select("id, name").order("id");
      if (!cancelled && r) {
        setRooms(r as Room[]);
        roomsRef.current = r as Room[];
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, router]);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  useEffect(() => {
    if (rooms.length === 0) return;
    if (!rooms.some((r) => r.id === roomId)) {
      setRoomId(rooms[0]!.id);
      setMobileThread(false);
    }
  }, [rooms, roomId]);

  useEffect(() => {
    if (!authed) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let alive = true;

    (async () => {
      const { data: initial } = await supabase
        .from("chat_messages")
        .select("id, body, created_at, user_id")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!alive) return;
      const enriched = await resolveNames((initial as Msg[] | null) ?? []);
      if (!alive) return;
      setMessages(enriched);

      channel = supabase
        .channel(`room:${roomId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
          async (payload) => {
            const row = payload.new as Msg;
            const [one] = await resolveNames([row]);
            setMessages((m) => [...m, one]);

            const self = myIdRef.current;
            if (row.user_id === self) return;
            const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
            const unfocused = typeof document !== "undefined" && !document.hasFocus();
            if (hidden || unfocused) {
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                const roomName = roomsRef.current.find((x) => x.id === roomId)?.name ?? "채팅";
                try {
                  new Notification(`오션중 허브 · ${roomName}`, {
                    body: row.body.slice(0, 160),
                    tag: row.id,
                  });
                } catch {
                  /* ignore */
                }
              }
            }
          }
        )
        .subscribe();
    })();

    return () => {
      alive = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [authed, roomId, supabase, resolveNames]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setText("");
    const { error } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      user_id: user.id,
      body: t.slice(0, 500),
      anonymous: false,
    });
    if (error) alert(error.message);
  }

  function pickRoom(id: string) {
    setRoomId(id);
    setMobileThread(true);
  }

  if (loading || !authed || !myId) {
    return <p className="text-[var(--text-muted)]">채팅을 불러오는 중...</p>;
  }

  const activeRoom = rooms.find((r) => r.id === roomId);

  return (
    <div
      className="relative -mx-4 flex min-h-[calc(100dvh-7.5rem)] flex-col sm:-mx-6"
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--surface-border)] px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--foam-light)] sm:text-2xl">메시지</h1>
          <p className="text-xs text-[var(--text-muted)]">방을 고른 뒤 대화하세요. 탭이 백그라운드일 때 새 메시지 알림을 켤 수 있습니다.</p>
        </div>
        {notifStatus !== "unsupported" && notifStatus !== "granted" && (
          <button type="button" onClick={() => void requestNotifications()} className="rounded-full border border-[var(--foam)]/40 px-3 py-1.5 text-xs font-medium text-[var(--foam-light)] hover:bg-[var(--foam)]/10">
            브라우저 알림 허용
          </button>
        )}
        {notifStatus === "granted" && (
          <span className="text-xs text-emerald-200/90">알림 켜짐</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 방 목록 — 인스타 DM 왼쪽 사이드 느낌 */}
        <aside
          className={`flex w-full max-w-full flex-col border-r border-[var(--surface-border)] bg-black/35 sm:max-w-[300px] md:max-w-[320px] ${
            mobileThread ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="border-b border-[var(--surface-border)]/80 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            대화
          </div>
          <ul className="flex-1 overflow-y-auto">
            {rooms.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => pickRoom(r.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                    roomId === r.id ? "bg-white/10 text-[var(--foam-light)]" : "text-[var(--text)] hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                      r.id === "admin"
                        ? "bg-gradient-to-br from-amber-500/40 to-amber-900/50"
                        : "bg-gradient-to-br from-[var(--foam)]/30 to-[var(--ocean-deep)]"
                    }`}
                  >
                    {r.id === "admin" ? "★" : "#"}
                  </span>
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate font-medium">{r.name}</span>
                    {r.id === "admin" && (
                      <span className="shrink-0 rounded-full bg-amber-500/25 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                        운영
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* 메시지 영역 */}
        <section
          className={`flex min-h-0 min-w-0 flex-1 flex-col bg-black/20 ${!mobileThread ? "hidden sm:flex" : "flex"}`}
        >
          <header className="flex items-center gap-2 border-b border-[var(--surface-border)]/80 px-3 py-3 sm:px-4">
            <button
              type="button"
              className="rounded-full p-2 text-[var(--foam-light)] sm:hidden"
              aria-label="방 목록"
              onClick={() => setMobileThread(false)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="flex-1 text-center text-base font-semibold text-[var(--text)] sm:text-left">{activeRoom?.name ?? roomId}</h2>
          </header>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-5">
            {messages.map((m) => {
              const mine = m.user_id === myId;
              return (
                <div key={m.id} className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] sm:max-w-[70%] ${mine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    {!mine && (
                      <span className="px-1 text-[11px] font-medium text-[var(--text-muted)]">{m.display_name}</span>
                    )}
                    <div
                      className={`rounded-[22px] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        mine
                          ? "rounded-br-md bg-gradient-to-br from-[var(--foam)]/35 to-[var(--foam)]/15 text-[var(--text)]"
                          : "rounded-bl-md bg-white/10 text-[var(--text)]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    </div>
                    <span className={`px-1 text-[10px] text-[var(--text-muted)] ${mine ? "text-right" : ""}`}>
                      {new Date(m.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={send} className="border-t border-[var(--surface-border)]/80 bg-[var(--ocean-deep)]/40 px-3 py-3 sm:px-4">
            <div className="mx-auto flex max-w-3xl items-end gap-2">
              <input
                className="input-ocean flex-1 rounded-full border-[var(--surface-border)] bg-black/25 py-3"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="메시지 보내기…"
                maxLength={500}
                aria-label="메시지 입력"
              />
              <button type="submit" className="btn-ocean shrink-0 rounded-full px-5 py-3 text-sm font-semibold">
                보내기
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
