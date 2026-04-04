"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Room = { id: string; name: string };
type Msg = {
  id: string;
  body: string;
  created_at: string;
  anonymous: boolean;
  user_id: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState("general");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [anon, setAnon] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setAuthed(true);
      const { data: r } = await supabase.from("chat_rooms").select("id, name").order("id");
      if (!cancelled && r) setRooms(r as Room[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, router]);

  useEffect(() => {
    if (!authed) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: initial } = await supabase
        .from("chat_messages")
        .select("id, body, created_at, anonymous, user_id")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100);
      setMessages((initial as Msg[] | null) ?? []);

      channel = supabase
        .channel(`room:${roomId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
          (payload) => {
            const row = payload.new as Msg;
            setMessages((m) => [...m, row]);
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [authed, roomId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setText("");
    const { error } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      user_id: user.id,
      body: t.slice(0, 500),
      anonymous: anon,
    });
    if (error) alert(error.message);
  }

  if (loading || !authed) {
    return <p className="text-[var(--text-muted)]">채팅방을 불러오는 중...</p>;
  }

  return (
    <div className="flex min-h-[60vh] flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foam-light)]">채팅</h1>
        <p className="text-sm text-[var(--text-muted)]">실시간 메시지는 Supabase Realtime이 켜져 있어야 합니다.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {rooms.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRoomId(r.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              roomId === r.id ? "bg-[var(--foam)]/25 text-[var(--foam-light)]" : "bg-black/20 text-[var(--text-muted)]"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="glass-card flex flex-1 flex-col overflow-hidden" style={{ minHeight: "360px" }}>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-black/20 px-3 py-2 text-sm"
            >
              <span className="text-xs text-[var(--text-muted)]">
                {m.anonymous ? "익명" : "회원"} · {new Date(m.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <p className="mt-1 text-[var(--text)]">{m.body}</p>
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="border-t border-[var(--surface-border)] p-3">
          <label className="mb-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
            익명으로 보내기
          </label>
          <div className="flex gap-2">
            <input
              className="input-ocean flex-1"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="메시지 (최대 500자)"
              maxLength={500}
            />
            <button type="submit" className="btn-ocean shrink-0">
              보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
