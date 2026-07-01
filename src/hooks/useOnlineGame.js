// src/hooks/useOnlineGame.js
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, ensureAuth } from "../lib/supabaseClient";

const code4 = () => Math.random().toString(36).slice(2, 6).toUpperCase();

/*
  useOnlineGame — จัดการเน็ตเวิร์กทั้งหมดของเกมออนไลน์
  ------------------------------------------------------
  createRoom(name, initialState) → สร้างห้อง ได้รหัส, ที่นั่ง = 'A'
  joinRoom(code, name)           → เข้าห้อง, ที่นั่ง = 'B'
  commit({state, turn, status, winner}) → เขียนสถานะใหม่ (เฉพาะตอนถึงตาเรา)
  leave()                        → ออกจากห้อง

  เอนจินเกม (X Kingdom เต็ม) ให้เก็บไว้ในก้อน `room.state` (JSONB)
  แล้ว render จาก `room.state` — เวลาผู้เล่นทำอะไรก็เรียก commit(...)
*/
export function useOnlineGame() {
  const [ready, setReady] = useState(false);
  const [uid, setUid] = useState(null);
  const [seat, setSeat] = useState(null);   // 'A' | 'B'
  const [room, setRoom] = useState(null);   // แถวจากตาราง games
  const [error, setError] = useState("");
  const channelRef = useRef(null);
  const codeRef = useRef(null);

  // เตรียม auth ตอนเริ่ม
  useEffect(() => {
    ensureAuth()
      .then((u) => { setUid(u.id); setReady(true); })
      .catch((e) => setError(e.message || "auth error"));
  }, []);

  // ยกเลิก subscription ตอน unmount
  useEffect(() => () => { if (channelRef.current) supabase.removeChannel(channelRef.current); }, []);

  const subscribe = useCallback((code) => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase
      .channel(`game:${code}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `code=eq.${code}` },
        (payload) => setRoom(payload.new)
      )
      .subscribe();
    channelRef.current = ch;
    codeRef.current = code;
  }, []);

  const createRoom = useCallback(async (name, initialState) => {
    setError("");
    try {
      const u = await ensureAuth();
      const code = code4();
      const row = {
        code, status: "waiting", player_a: u.id, player_a_name: name || "ผู้เล่น 1",
        turn: "A", state: initialState || {}, version: 1,
      };
      const { data, error } = await supabase.from("games").insert(row).select().single();
      if (error) throw error;
      setSeat("A"); setRoom(data); subscribe(code);
      return data;
    } catch (e) { setError(e.message || "create failed"); throw e; }
  }, [subscribe]);

  const joinRoom = useCallback(async (rawCode, name, startState) => {
    setError("");
    try {
      const u = await ensureAuth();
      const code = (rawCode || "").trim().toUpperCase();
      const { data: existing, error: selErr } = await supabase
        .from("games").select("*").eq("code", code).single();
      if (selErr || !existing) throw new Error("ไม่พบห้องนี้");
      if (existing.player_b && existing.player_b !== u.id) throw new Error("ห้องนี้เต็มแล้ว");

      const patch = {
        player_b: u.id, player_b_name: name || "ผู้เล่น 2", status: "playing",
        version: (existing.version || 1) + 1,
      };
      // ถ้าผู้สร้างส่ง initialState ไว้แล้วก็ใช้ของเดิม; ไม่งั้น seed ด้วย startState
      if (startState && (!existing.state || Object.keys(existing.state).length === 0)) patch.state = startState;

      const { data, error } = await supabase
        .from("games").update(patch).eq("code", code).select().single();
      if (error) throw error;
      setSeat("B"); setRoom(data); subscribe(code);
      return data;
    } catch (e) { setError(e.message || "join failed"); throw e; }
  }, [subscribe]);

  // เขียนสถานะใหม่ (optimistic + กันชนด้วย version)
  const commit = useCallback(async ({ state, turn, status, winner }) => {
    const code = codeRef.current;
    if (!code || !room) return;
    const patch = { version: (room.version || 1) + 1 };
    if (state !== undefined) patch.state = state;
    if (turn !== undefined) patch.turn = turn;
    if (status !== undefined) patch.status = status;
    if (winner !== undefined) patch.winner = winner;

    setRoom((r) => ({ ...r, ...patch }));   // optimistic
    const { error } = await supabase
      .from("games").update(patch).eq("code", code)
      .eq("version", room.version);          // เขียนทับได้เฉพาะถ้าไม่มีใครเขียนแซง
    if (error) setError(error.message);
  }, [room]);

  const leave = useCallback(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = null; codeRef.current = null;
    setSeat(null); setRoom(null); setError("");
  }, []);

  const myTurn = !!(room && seat && room.turn === seat && room.status === "playing");

  return { ready, uid, seat, room, error, myTurn, createRoom, joinRoom, commit, leave };
}
