// src/components/OnlineGame.jsx
// ตัวอย่างต่อสายพร้อมใช้ — กติกาเวอร์ชันย่อ (โล่ 3, ลงฮีโร่, ตี Kingdom)
// ใช้เพื่อ "ยืนยันว่า realtime ของ Supabase ทำงาน" ก่อนพอร์ตเอนจิน X Kingdom เต็ม
import React, { useState } from "react";
import { useOnlineGame } from "../hooks/useOnlineGame";

const rid = () => Math.random().toString(36).slice(2, 7);
const hand = (n) => Array.from({ length: n }, () => ({ id: rid(), atk: 1 + Math.floor(Math.random() * 4) }));
const other = (s) => (s === "A" ? "B" : "A");

// สถานะเกมเริ่มต้น (จะไปอยู่ในคอลัมน์ state JSONB)
const initialState = () => ({
  boards: {
    A: { shields: 3, hand: hand(3), front: [] },
    B: { shields: 3, hand: hand(3), front: [] },
  },
  log: ["เริ่มเกม — ตาผู้เล่น 1"],
});

export default function OnlineGame() {
  const { ready, seat, room, error, myTurn, createRoom, joinRoom, commit, leave } = useOnlineGame();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  if (!ready) return <Center>กำลังเชื่อมต่อ...</Center>;

  // ----- เมนู -----
  if (!room) {
    return (
      <Center>
        <h1 style={{ letterSpacing: 3 }}>X KINGDOM — ONLINE</h1>
        <input placeholder="ชื่อของคุณ" value={name} onChange={(e) => setName(e.target.value)} style={inp} />
        <button style={btn} onClick={() => createRoom(name, initialState())}>สร้างห้องใหม่</button>
        <div style={{ margin: "6px 0", color: "#888" }}>— หรือ —</div>
        <input placeholder="รหัสห้อง" value={joinCode} maxLength={4}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())} style={inp} />
        <button style={btnAlt} onClick={() => joinRoom(joinCode, name)}>เข้าห้อง</button>
        {error && <p style={{ color: "#e57" }}>{error}</p>}
      </Center>
    );
  }

  // ----- lobby (รอเพื่อน) -----
  if (room.status === "waiting") {
    return (
      <Center>
        <h2>ห้องของคุณ</h2>
        <div style={{ fontSize: 40, letterSpacing: 8, color: "#C8A24B" }}>{room.code}</div>
        <p>ส่งรหัสนี้ให้เพื่อน แล้วรอเขาเข้าห้อง...</p>
        <button style={ghost} onClick={leave}>ออก</button>
      </Center>
    );
  }

  // ----- จบเกม -----
  if (room.status === "over") {
    const iWon = room.winner === seat;
    return (
      <Center>
        <h1>{iWon ? "คุณชนะ!" : "คุณแพ้"}</h1>
        <button style={btn} onClick={leave}>กลับเมนู</button>
      </Center>
    );
  }

  // ----- เล่น -----
  const s = room.state;
  const me = s.boards[seat];
  const opp = s.boards[other(seat)];

  const playCard = (i) => {
    if (!myTurn) return;
    const st = structuredClone(s);
    const [c] = st.boards[seat].hand.splice(i, 1);
    st.boards[seat].front.push({ id: c.id, atk: c.atk, used: false });
    st.log = [`ลงฮีโร่ ATK ${c.atk}`, ...st.log].slice(0, 20);
    commit({ state: st });
  };
  const attack = (i) => {
    if (!myTurn) return;
    const st = structuredClone(s);
    const h = st.boards[seat].front[i];
    if (!h || h.used) return;
    h.used = true;
    const o = st.boards[other(seat)];
    o.shields = Math.max(0, o.shields - 1);
    st.log = [`โจมตี Kingdom → โล่เหลือ ${o.shields}`, ...st.log].slice(0, 20);
    if (o.shields <= 0) commit({ state: st, status: "over", winner: seat });
    else commit({ state: st });
  };
  const endTurn = () => {
    if (!myTurn) return;
    const st = structuredClone(s);
    const nt = other(seat);
    st.boards[nt].front.forEach((h) => (h.used = false));
    if (st.boards[nt].hand.length < 7) st.boards[nt].hand.push(hand(1)[0]);
    st.log = [`— ตาของผู้เล่น ${nt} —`, ...st.log].slice(0, 20);
    commit({ state: st, turn: nt });
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#E8DCC0", fontFamily: "Georgia,serif", padding: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>ห้อง <b>{room.code}</b></span>
        <b style={{ color: myTurn ? "#7ED9A0" : "#C6472F" }}>{myTurn ? "● ตาคุณ" : "○ รอคู่แข่ง"}</b>
        <button style={ghost} onClick={leave}>ออก</button>
      </div>

      <Panel title={`คู่แข่ง · โล่ ${opp.shields}`}>
        {opp.front.map((h) => <span key={h.id} style={{ ...chip, opacity: h.used ? .5 : 1 }}>⚔{h.atk}</span>)}
      </Panel>

      <Panel title={`คุณ · โล่ ${me.shields}`}>
        {me.front.map((h, i) => (
          <button key={h.id} disabled={!myTurn || h.used} onClick={() => attack(i)}
            style={{ ...chip, borderColor: "#3E8E7E", opacity: h.used ? .45 : 1 }}>⚔{h.atk}</button>
        ))}
      </Panel>

      <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>มือ:</div>
      <div>
        {me.hand.map((c, i) => (
          <button key={c.id} disabled={!myTurn} onClick={() => playCard(i)}
            style={{ ...chip, borderColor: "#C8A24B", opacity: myTurn ? 1 : .5 }}>⚔{c.atk}</button>
        ))}
      </div>

      <button style={{ ...btn, marginTop: 10, opacity: myTurn ? 1 : .4 }} disabled={!myTurn} onClick={endTurn}>
        จบเทิร์น
      </button>

      <div style={{ marginTop: 10, fontSize: 11, color: "#999", maxHeight: 90, overflowY: "auto" }}>
        {s.log.map((l, i) => <div key={i} style={{ opacity: i === 0 ? 1 : .5 }}>{l}</div>)}
      </div>
    </div>
  );
}

const Center = ({ children }) => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "#E8DCC0", fontFamily: "Georgia,serif", background: "#0F0B18" }}>{children}</div>
);
const Panel = ({ title, children }) => (
  <div style={{ border: "1px solid #2A2440", borderRadius: 8, padding: 8, marginTop: 8 }}>
    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{title}</div>
    <div>{children}</div>
  </div>
);
const inp = { padding: "10px 14px", borderRadius: 6, border: "1px solid #3A3550", background: "#1a1626", color: "#E8DCC0", fontSize: 16, textAlign: "center" };
const btn = { background: "#8E2B2B", color: "#E8DCC0", border: "none", padding: "12px 28px", fontSize: 16, fontWeight: 700, borderRadius: 6, cursor: "pointer" };
const btnAlt = { ...btn, background: "#2E5A7A" };
const ghost = { background: "transparent", border: "1px solid #888", color: "#aaa", padding: "4px 12px", borderRadius: 5, cursor: "pointer" };
const chip = { display: "inline-block", minWidth: 44, textAlign: "center", background: "#1a1626", border: "1.5px solid #C6472F", borderRadius: 5, padding: "8px 10px", margin: 3, color: "#E8DCC0", fontWeight: 700, cursor: "pointer" };
