// src/components/OnlineGame.jsx
// X Kingdom — ONLINE full engine (v0.3-net, lean-state, +cardart)
// เก็บใน room.state แค่ code+สถานะต่อใบ แล้ว lookup รายละเอียดจากตาราง CARD
import React, { useState, useEffect } from "react";
import { useOnlineGame } from "../hooks/useOnlineGame";

/* ============== ข้อมูลการ์ดไฟจริง (50 ใบ) ============== */
const FIRE = [
  { code:"F1a", name:"Sita, Ash Vanquisher", r:"N", type:"hero", lvl:1, cost:1, atk:1, def:0, cri:1, count:4, art:"lv1-1", text:"Trigger: จั่ว 1 ใบ", eff:{ trigger:"draw" } },
  { code:"F1b", name:"พลธนูเพลิง",  r:"N", type:"hero", lvl:1, cost:1, atk:2, def:0, cri:1, count:4, art:"lv1-2", text:"—" },
  { code:"F1c", name:"หมอไฟ",       r:"N", type:"hero", lvl:1, cost:1, atk:1, def:1, cri:1, count:4, art:"lv1-3", text:"Skill(1): Hero 1 ใบ ATK+1 จนจบเทิร์น", eff:{ skill:{ cost:1, need:"anyHero", kind:"buffAtk", val:1, label:"ATK+1 ใส่ Hero" } } },
  { code:"F1d", name:"นักรบคลั่งไฟ", r:"U", type:"hero", lvl:1, cost:2, atk:2, def:0, cri:1, count:4, art:"lv1-4", text:"เข้ามา: ตัวเอง ATK+2 จนจบเทิร์น", eff:{ etb:{ kind:"selfAtk", val:2 } } },
  { code:"F1e", name:"องครักษ์เพลิง",r:"R", type:"hero", lvl:1, cost:3, atk:2, def:1, cri:1, count:4, art:"lv1-5", text:"SkillReact(2): ดึงเป้าโจมตี (แมนนวล)", eff:{ manual:true } },
  { code:"F2a", name:"แม่ทัพเพลิง",  r:"N", type:"hero", lvl:2, cost:4, atk:3, def:1, cri:1, count:2, art:"lv2-1", text:"Static: ห้ามตีข้ามไลน์ (แมนนวล)", eff:{ manual:true } },
  { code:"F2b", name:"อัศวินอัคคี",  r:"N", type:"hero", lvl:2, cost:4, atk:4, def:2, cri:2, count:2, art:"lv2-2", text:"[H] โจมตีลม ATK+1 (แมนนวล)", eff:{ manual:true } },
  { code:"F2c", name:"ผู้นำไฟ",      r:"U", type:"hero", lvl:2, cost:4, atk:2, def:2, cri:1, count:2, art:"lv2-3", text:"[H] ATK+1 ต่อไฟใน At Line (แมนนวล)", eff:{ manual:true } },
  { code:"F2d", name:"จอมพลเพลิง",   r:"R", type:"hero", lvl:2, cost:5, atk:4, def:3, cri:1, count:2, art:"lv2-4", text:"SkillReact(1): ดึง Hero กลับ At (แมนนวล)", eff:{ manual:true } },
  { code:"F3a", name:"มังกรเพลิง",   r:"N", type:"hero", lvl:3, cost:6, atk:6, def:3, cri:2, count:2, art:"lv3-1", text:"—" },
  { code:"F3b", name:"ราชันเพลิง",   r:"U", type:"hero", lvl:3, cost:6, atk:4, def:3, cri:1, count:2, art:"lv3-2", text:"ออร่า: ไฟอื่น ATK+1 DEF-2 (แมนนวล)", eff:{ manual:true } },
  { code:"F3c", name:"จอมมารเพลิง",  r:"R", type:"hero", lvl:3, cost:7, atk:5, def:4, cri:1, count:2, art:"lv3-3", text:"Skill(5)(At Line): ทำลาย Hero Lv<3", eff:{ skill:{ cost:5, need:"enemyLo", kind:"destroy", line:"front", label:"ทำลาย Hero Lv<3" } } },
  { code:"I1",  name:"ตราไฟ",        r:"U", type:"item", cost:3, count:2, art:"item-1", text:"ติด Kingdom: FireMastery (แมนนวล)", eff:{ manual:true } },
  { code:"I2",  name:"ดาบเพลิง",     r:"U", type:"item", cost:2, count:2, art:"item-2", text:"ติดไฟ: ATK+1 CRI+1 (แมนนวล)", eff:{ manual:true } },
  { code:"A1",  name:"โหมเพลิง",     r:"U", type:"action", cost:1, count:2, art:"act-1", text:"ตีเสร็จไม่ไหลลง (แมนนวล)", eff:{ manual:true } },
  { code:"A2",  name:"ทำลายอาวุธ",   r:"U", type:"action", cost:2, count:2, art:"act-2", text:"ทำลาย Item (แมนนวล)", eff:{ manual:true } },
  { code:"A3",  name:"เพลิงชำระ",    r:"U", type:"action", cost:3, count:2, art:"act-3", text:"ทิ้ง 2 จั่ว 3", eff:{ action:"discardDraw" } },
  { code:"A4",  name:"นรกเพลิง",     r:"R", type:"action", cost:5, count:2, art:"act-4", text:"Hero Lv.3 โจมตี All (แมนนวล)", eff:{ manual:true } },
  { code:"A5",  name:"Strategic Insight", r:"-", type:"action", cost:2, count:2, art:"act-5", text:"จั่ว 2 วาง 1 ใบใต้กอง", eff:{ action:"draw2bottom1" } },
  { code:"A6",  name:"Tactical Advance",  r:"-", type:"action", cost:2, count:2, art:"act-6", text:"Hero 1 ตัว ATK+1 DEF+1 จนจบเทิร์น", eff:{ action:"buffTarget" } },
];
const CARD = {}; FIRE.forEach(c=>{ CARD[c.code]=c; });
const ART_EL = "fire"; // เด็คปัจจุบันเป็นไฟ (ตอนเพิ่มเลือกธาตุค่อยทำ per-card)
const artSrc = (art)=> art ? `/cards/${ART_EL}/${art}.jpg` : "";
const PHASES = ["Start","Draw","Mana","Main","End"];
const PH = { Start:"เริ่มเทิร์น", Draw:"จั่ว", Mana:"วางมานา", Main:"เมนเฟส", End:"จบเทิร์น" };
const other = (s)=> s==="A"?"B":"A";
const shuffle = (a)=>{ const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];} return x; };

/* ---- lean instance helpers (lookup ข้อมูลการ์ดจาก code) ---- */
const bc = (x)=> CARD[x.code] || {};
const aOf = (h)=> (bc(h).atk||0)+(h.tAtk||0);
const dOf = (h)=> (bc(h).def||0)+(h.tDef||0);

/* ============== สร้างสถานะเริ่มต้น (เก็บแค่ code+uid) ============== */
function buildDeck(seed){
  const d=[]; for(const c of FIRE) for(let i=0;i<c.count;i++) d.push({ code:c.code, uid:`${seed}${d.length}` });
  return shuffle(d);
}
function newPlayer(seed){
  const deck=buildDeck(seed); const hand=deck.splice(0,7);
  return { kingdom:{ shields:3 }, deck, hand, mana:[], front:[], back:[], grave:[] };
}
export function initialState(){
  return { players:{ A:newPlayer("a"), B:newPlayer("b") }, active:"A", phaseIdx:0, turnNo:0, firstPlayer:"A",
    winner:null, log:["เริ่มเกม — ตาผู้เล่น A (เทิร์นแรกโจมตีไม่ได้)"] };
}

/* ============== ตรรกะเกม ============== */
const push=(ns,m)=> ns.log=[m,...ns.log].slice(0,40);
const clearBuffs=(p)=> [...p.front,...p.back].forEach(h=>{h.tAtk=0;h.tDef=0;});
function payMana(ns,cost){ const p=ns.players[ns.active]; let paid=0; for(const m of p.mana){ if(paid>=cost)break; if(!m.rested){m.rested=true;paid++;} } return paid>=cost; }
function kingdomDead(p){ return p.kingdom.shields<=0 && p.mana.length>0 && p.mana.every(m=>m.faceUp); }

function advance(ns){
  if(ns.phaseIdx<4){
    const idx=ns.phaseIdx+1, name=PHASES[idx], p=ns.players[ns.active];
    if(name==="Draw"){ if(p.deck.length===0){ ns.winner=other(ns.active); push(ns,"จั่วไม่ได้ — แพ้!"); return; } p.hand.push(p.deck.shift()); push(ns,"จั่ว 1 ใบ"); }
    else if(name==="Mana"){ if(p.mana.length<12&&p.deck.length>0){ const c=p.deck.shift(); p.mana.push({uid:c.uid,code:c.code,faceUp:false,rested:false}); } push(ns,"วางมานา 1 ใบ (คว่ำ)"); }
    else if(name==="Main"){ push(ns,"เมนเฟส"); }
    else if(name==="End"){ while(p.hand.length>10) p.grave.push(p.hand.pop()); clearBuffs(p); push(ns,"จบเทิร์น"); }
    ns.phaseIdx=idx;
  } else {
    clearBuffs(ns.players[ns.active]);
    ns.active=other(ns.active); ns.turnNo+=1; ns.phaseIdx=0;
    const np=ns.players[ns.active];
    [...np.front,...np.back].forEach(h=>{h.rested=false;h.switched=false;}); np.mana.forEach(m=>m.rested=false);
    push(ns,`— ตาของผู้เล่น ${ns.active} —`);
  }
}
function playHero(ns,idx,line){
  const p=ns.players[ns.active], c=p.hand[idx]; if(!c) return; const base=CARD[c.code];
  if(!payMana(ns,base.cost)) return;
  p.hand.splice(idx,1);
  const inst={ code:c.code, uid:c.uid, rested:false, tAtk:0, tDef:0, switched:false };
  if(base.eff?.etb?.kind==="selfAtk") inst.tAtk+=base.eff.etb.val;
  (line==="front"?p.front:p.back).push(inst);
  push(ns,`ลง ${base.name} (${line==="front"?"Front":"Back"})${base.eff?.etb?" · ATK+"+base.eff.etb.val:""}`);
}
function playActionSimple(ns,idx){
  const p=ns.players[ns.active], c=p.hand[idx]; if(!c) return; const base=CARD[c.code];
  if(!payMana(ns,base.cost)) return;
  p.hand.splice(idx,1);
  if(base.eff?.action==="discardDraw"){ for(let i=0;i<2&&p.hand.length>0;i++) p.grave.push(p.hand.shift()); for(let i=0;i<3&&p.deck.length>0;i++) p.hand.push(p.deck.shift()); }
  else if(base.eff?.action==="draw2bottom1"){ for(let i=0;i<2&&p.deck.length>0;i++) p.hand.push(p.deck.shift()); if(p.hand.length>0) p.deck.push(p.hand.shift()); }
  p.grave.push({code:c.code,uid:c.uid}); push(ns,`ใช้ ${base.name}`);
}
function switchLine(ns,uid){
  const p=ns.players[ns.active];
  let from=p.front,to=p.back,i=p.front.findIndex(x=>x.uid===uid);
  if(i<0){ from=p.back; to=p.front; i=p.back.findIndex(x=>x.uid===uid); }
  if(i<0) return; const mv=from[i]; if(mv.switched) return; from.splice(i,1); mv.switched=true; to.push(mv);
  push(ns,`${bc(mv).name} สลับไลน์`);
}
function resolveTarget(ns,pending,ownerIsActive,line,idx){
  if(!payMana(ns,pending.cost)) return;
  const meP=ns.players[ns.active], oppP=ns.players[other(ns.active)];
  const tgtP=ownerIsActive?meP:oppP, arr=line==="front"?tgtP.front:tgtP.back, target=arr[idx];
  if(!target) return;
  if(pending.kind==="buffAtk") target.tAtk=(target.tAtk||0)+pending.val;
  else if(pending.kind==="buffBoth"){ target.tAtk=(target.tAtk||0)+pending.val; target.tDef=(target.tDef||0)+pending.val; }
  else if(pending.kind==="destroy"){ arr.splice(idx,1); tgtP.grave.push({code:target.code,uid:target.uid}); }
  if(pending.restSrc&&pending.srcUid){ const src=[...meP.front,...meP.back].find(x=>x.uid===pending.srcUid); if(src) src.rested=true; }
  if(pending.fromHand!=null){ const hi=meP.hand.findIndex(c=>CARD[c.code]?.eff?.action==="buffTarget"); if(hi>=0){ const [card]=meP.hand.splice(hi,1); meP.grave.push({code:card.code,uid:card.uid}); } }
  push(ns,`${pending.label} → สำเร็จ`);
}
function attackHero(ns,selUid,line,idx){
  const A=ns.players[ns.active], D=ns.players[other(ns.active)];
  const attacker=A.front.find(h=>h.uid===selUid); if(!attacker) return;
  const defArr=line==="front"?D.front:D.back, target=defArr[idx]; if(!target) return;
  const a=aOf(attacker);
  if(line==="front"){
    const t=aOf(target);
    if(a>t){ defArr.splice(idx,1); D.grave.push({code:target.code,uid:target.uid}); push(ns,`${bc(attacker).name}(${a}) ชนะ ${bc(target).name}(${t})`); }
    else if(a===t){ defArr.splice(idx,1); D.grave.push({code:target.code,uid:target.uid}); const i=A.front.findIndex(h=>h.uid===selUid); const dead=A.front.splice(i,1)[0]; A.grave.push({code:dead.code,uid:dead.uid}); push(ns,`${bc(attacker).name} เสมอ ${bc(target).name} → ตายคู่`); }
    else { const i=A.front.findIndex(h=>h.uid===selUid); const dead=A.front.splice(i,1)[0]; A.grave.push({code:dead.code,uid:dead.uid}); push(ns,`${bc(attacker).name}(${a}) แพ้ ${bc(target).name}(${t})`); }
  } else {
    const d=dOf(target);
    if(a>d){ defArr.splice(idx,1); D.grave.push({code:target.code,uid:target.uid}); push(ns,`${bc(attacker).name}(ATK ${a}) > DEF ${d} → ${bc(target).name} ตาย`); }
    else push(ns,`${bc(attacker).name}(ATK ${a}) ≤ DEF ${d} → ไม่ตาย`);
  }
  const alive=A.front.find(h=>h.uid===selUid);
  if(alive){ const i=A.front.findIndex(h=>h.uid===selUid); const mv=A.front.splice(i,1)[0]; mv.rested=true; A.back.push(mv); }
}
function attackKingdom(ns,selUid){
  const A=ns.players[ns.active], D=ns.players[other(ns.active)];
  const attacker=A.front.find(h=>h.uid===selUid); if(!attacker) return; const cri=bc(attacker).cri||1;
  if(D.kingdom.shields>0){ D.kingdom.shields-=1; push(ns,`${bc(attacker).name} ตี Kingdom → โล่เหลือ ${D.kingdom.shields}`); }
  else { let flipped=0,drew=0; for(const m of D.mana){ if(flipped>=cri)break; if(!m.faceUp){ m.faceUp=true; flipped++; if(CARD[m.code]?.eff?.trigger==="draw"&&D.deck.length>0){ D.hand.push(D.deck.shift()); drew++; } } } push(ns,`${bc(attacker).name} ตี Kingdom (โล่หมด) → หงาย ${flipped}${drew?` · จั่ว ${drew}`:""}`); }
  const i=A.front.findIndex(h=>h.uid===selUid); const mv=A.front.splice(i,1)[0]; mv.rested=true; A.back.push(mv);
  if(kingdomDead(D)) ns.winner=ns.active;
}

/* ============== คอมโพเนนต์ ============== */
/* ============== บอท (ระดับ B: กลยุทธ์พื้นฐาน) ============== */
function bestHeroToPlay(hand, avail){
  let best=-1, bestCost=-1;
  hand.forEach((c,i)=>{ const b=CARD[c.code]; if(b && b.type==="hero" && b.cost<=avail && b.cost>bestCost){ bestCost=b.cost; best=i; } });
  return best;
}
function pickAttack(ns){
  const A=ns.players.A, B=ns.players.B;
  const attackers=B.front.filter(h=>!h.rested);
  if(attackers.length===0) return null;
  // 1) หาการตีฮีโร่หน้าที่ชนะ/เสมอ (เคลียร์บล็อค)
  for(const at of attackers){
    const atk=aOf(at);
    let bestIdx=-1,bestTa=999;
    A.front.forEach((t,idx)=>{ const ta=aOf(t); if(atk>=ta && ta<bestTa){bestTa=ta;bestIdx=idx;} });
    if(bestIdx>=0) return { uid:at.uid, line:"front", idx:bestIdx };
  }
  // 2) ไม่มีเทรดคุ้ม → บุก Kingdom ด้วยตัวแรงสุด
  const strongest=attackers.slice().sort((a,b)=>aOf(b)-aOf(a))[0];
  return { uid:strongest.uid, kingdom:true };
}
function botAct(s){
  const ns=structuredClone(s);
  if(ns.phaseIdx<3){ advance(ns); return ns; }        // Start→Draw→Mana→Main
  if(ns.phaseIdx===3){                                 // Main
    const B=ns.players.B;
    const avail=B.mana.filter(m=>!m.rested).length;
    const hi=bestHeroToPlay(B.hand, avail);
    if(hi>=0){ playHero(ns,hi,"front"); return ns; }   // ลงฮีโร่แพงสุดที่จ่ายได้
    const plan=pickAttack(ns);
    if(plan){ if(plan.kingdom) attackKingdom(ns,plan.uid); else attackHero(ns,plan.uid,plan.line,plan.idx); return ns; }
    advance(ns); return ns;                             // ไม่มีอะไรทำ → ไป End
  }
  advance(ns); return ns;                               // End → สลับตากลับผู้เล่น
}

/* ============== เมนูเลือกโหมด (default export) ============== */
export default function Root(){
  const [mode,setMode]=useState(null);
  if(mode==="bot") return <LocalGame onExit={()=>setMode(null)}/>;
  if(mode==="online") return <OnlineFlow onExit={()=>setMode(null)}/>;
  return (
    <Center>
      <div style={{fontSize:48,color:"#8E2B2B"}}>♛</div>
      <h1 style={{letterSpacing:3,margin:0}}>X KINGDOM</h1>
      <p style={{color:"#8A8172",margin:"0 0 6px",fontStyle:"italic"}}>เกมการ์ดต่อสู้</p>
      <button style={B1} onClick={()=>setMode("bot")}>⚔️ ฝึกกับบอท</button>
      <button style={B2} onClick={()=>setMode("online")}>👥 เล่นกับเพื่อน</button>
    </Center>
  );
}

/* ============== โหมดฝึกกับบอท (เล่นในเครื่อง ไม่แตะเซิร์ฟเวอร์) ============== */
function LocalGame({onExit}){
  const [s,setS]=useState(()=>initialState());
  const apply=(patch)=> setS(patch.state);
  const myTurn = s.active==="A" && !s.winner;
  useEffect(()=>{
    if(s.winner || s.active!=="B") return;
    const t=setTimeout(()=>{ setS(cur=> (cur.active==="B" && !cur.winner) ? botAct(cur) : cur); }, 620);
    return ()=>clearTimeout(t);
  }, [s]);
  return <GameView s={s} seat="A" myTurn={myTurn} meName="คุณ" opName="บอท" code={null} onLeave={onExit} apply={apply}/>;
}

/* ============== โหมดเล่นกับเพื่อน (ออนไลน์ Supabase) ============== */
function OnlineFlow({onExit}){
  const { ready, seat, room, error, myTurn, createRoom, joinRoom, commit, leave } = useOnlineGame();
  const [name,setName]=useState(""); const [joinCode,setJoinCode]=useState("");

  if(!ready) return <Center>กำลังเชื่อมต่อ...</Center>;

  if(!room) return (
    <Center>
      <div style={{fontSize:44,color:"#8E2B2B"}}>♛</div>
      <h1 style={{letterSpacing:3,margin:0}}>เล่นกับเพื่อน</h1>
      <input style={I} placeholder="ชื่อของคุณ" value={name} onChange={e=>setName(e.target.value)}/>
      <button style={B1} onClick={()=>createRoom(name, initialState())}>สร้างห้องใหม่</button>
      <div style={{color:"#6B6355",fontSize:12}}>— หรือ —</div>
      <input style={I} placeholder="รหัสห้อง (4 ตัว)" value={joinCode} maxLength={4} onChange={e=>setJoinCode(e.target.value.toUpperCase())}/>
      <button style={B2} onClick={()=>joinRoom(joinCode,name)}>เข้าห้อง</button>
      {error && <p style={{color:"#E0894F",fontSize:13,maxWidth:300}}>ผิดพลาด: {error}</p>}
      <button style={{...GH,marginTop:8}} onClick={onExit}>← กลับเมนูหลัก</button>
    </Center>
  );

  if(room.status==="waiting") return (
    <Center>
      <h2>ห้องของคุณ</h2>
      <div style={{fontSize:40,letterSpacing:8,color:"#C8A24B",border:"1px solid #C8A24B",borderRadius:8,padding:"10px 22px"}}>{room.code}</div>
      <p style={{color:"#8A8172"}}>ส่งรหัสให้เพื่อน แล้วรอเข้าห้อง...</p>
      <button style={GH} onClick={leave}>ออก</button>
    </Center>
  );

  const s=room.state;
  if(!s || !s.players){ return <Center>กำลังโหลดกระดาน...<button style={GH} onClick={leave}>ออก</button></Center>; }
  return <GameView s={s} seat={seat} myTurn={myTurn}
    meName={seat==="A"?room.player_a_name:room.player_b_name}
    opName={seat==="A"?room.player_b_name:room.player_a_name}
    code={room.code} onLeave={leave} apply={commit}/>;
}

/* ============== กระดานเกม (ใช้ร่วมทั้ง 2 โหมด) ============== */
function GameView({s, seat, myTurn, meName, opName, code, onLeave, apply}){
  const [sel,setSel]=useState(null); const [pending,setPending]=useState(null);

  if(s.winner){
    const iWon=s.winner===seat;
    return (<Center><div style={{fontSize:44,color:iWon?"#C8A24B":"#8A8172"}}>♛</div><h1>{iWon?"คุณชนะ!":"คุณแพ้"}</h1><button style={B1} onClick={onLeave}>กลับเมนู</button></Center>);
  }

  const meP=s.players[seat], opP=s.players[other(seat)];
  const phase=PHASES[s.phaseIdx];
  const activeMana=meP.mana.filter(m=>!m.rested).length;
  const isMain=myTurn&&phase==="Main";
  const firstTurnLock=s.turnNo===0&&s.active===s.firstPlayer;

  const act=(mut)=>{ const ns=structuredClone(s); mut(ns); const patch={state:ns,turn:ns.active}; if(ns.winner){patch.status="over";patch.winner=ns.winner;} apply(patch); };
  const canCast=(base)=> isMain && activeMana>=base.cost;

  const doNext=()=>{ if(!myTurn)return; setSel(null); setPending(null); act(ns=>advance(ns)); };
  const doPlayHero=(idx,line)=>{ const base=CARD[meP.hand[idx].code]; if(!canCast(base))return; act(ns=>playHero(ns,idx,line)); };
  const doPlayAction=(idx)=>{ const base=CARD[meP.hand[idx].code]; if(!canCast(base))return;
    if(base.eff?.action==="buffTarget"){ setSel(null); setPending({fromHand:idx,need:"anyHero",kind:"buffBoth",val:1,label:base.name,cost:base.cost}); return; }
    act(ns=>playActionSimple(ns,idx)); };
  const doSkill=(h)=>{ if(!isMain)return; const base=CARD[h.code]; const sk=base.eff?.skill; if(!sk||h.rested)return;
    if(sk.line==="front"&&!meP.front.some(x=>x.uid===h.uid))return; if(activeMana<sk.cost)return;
    setSel(null); setPending({srcUid:h.uid,need:sk.need,kind:sk.kind,val:sk.val,label:`${base.name}: ${sk.label}`,cost:sk.cost,restSrc:true}); };
  const doSwitch=(h)=>{ if(!isMain||h.switched)return; setSel(null); act(ns=>switchLine(ns,h.uid)); };

  const heroMatches=(need,ownerIsMe,h)=> need==="anyHero"?true : need==="enemyLo"?(!ownerIsMe&&(CARD[h.code].lvl||9)<3):false;
  const onHero=(ownerIsMe,line,h,idx)=>{
    if(pending){ if(heroMatches(pending.need,ownerIsMe,h)){ const pend=pending; setPending(null); act(ns=>resolveTarget(ns,pend,ownerIsMe,line,idx)); } return; }
    if(!isMain) return;
    if(ownerIsMe){ if(line!=="front"||firstTurnLock||h.rested)return; setSel(sel===h.uid?null:h.uid); }
    else { if(!sel)return; if(line==="back"&&opP.front.length>0)return; const su=sel; setSel(null); act(ns=>attackHero(ns,su,line,idx)); }
  };
  const onKingdom=()=>{ if(pending||!isMain||!sel)return; const su=sel; setSel(null); act(ns=>attackKingdom(ns,su)); };

  return (
    <div style={{maxWidth:480,margin:"0 auto",color:"#E8DCC0",fontFamily:"Georgia,serif",padding:8,display:"flex",flexDirection:"column",gap:6}}>
      <div style={HUD}>
        <span>{code?<>ห้อง <b>{code}</b></>:<b>ฝึกกับบอท</b>}</span>
        <b style={{color:myTurn?"#7ED9A0":"#C6472F"}}>{myTurn?`● ตาคุณ · ${PH[phase]}`:`○ ตา ${opName||"คู่แข่ง"}`}</b>
        <button style={GH} onClick={onLeave}>ออก</button>
      </div>

      <Board p={opP} isMe={false} name={opName||"คู่แข่ง"} sel={sel} pending={pending} onHero={onHero} onKingdom={onKingdom}/>

      <div style={BAR}>
        {myTurn ? (
          <div style={{display:"flex",alignItems:"center",gap:8,justifyContent:"space-between"}}>
            <span style={{fontSize:12}}>Cost ว่าง <b style={{color:"#C8A24B"}}>{activeMana}</b>/{meP.mana.length}</span>
            <button style={NEXT} onClick={doNext}>{s.phaseIdx<4?`ไป ${PH[PHASES[s.phaseIdx+1]]} →`:"จบเทิร์น ⟳"}</button>
          </div>
        ) : <span style={{fontSize:12,color:"#8A8172"}}>{opName||"คู่แข่ง"} กำลังเล่น...</span>}
        {pending && <div style={{fontSize:11,color:"#C8A24B",marginTop:4}}>{pending.label} — แตะ Hero เป้าหมาย <button style={MINI} onClick={()=>setPending(null)}>ยกเลิก</button></div>}
        {sel && !pending && <div style={{fontSize:11,color:"#7ED9A0",marginTop:4}}>เลือกเป้าโจมตี: Hero ตรงข้าม / Kingdom <button style={MINI} onClick={()=>setSel(null)}>ยกเลิก</button></div>}
        {firstTurnLock && myTurn && <div style={{fontSize:10,color:"#8A8172",marginTop:2}}>* เทิร์นแรก โจมตีไม่ได้</div>}
      </div>

      <Board p={meP} isMe={true} name={`${meName||"คุณ"} (คุณ)`} sel={sel} pending={pending}
        onHero={onHero} onKingdom={()=>{}} isMain={isMain} onSkill={doSkill} onSwitch={doSwitch}/>

      <div style={{background:"rgba(0,0,0,.25)",borderRadius:8,padding:8,border:"1px solid #2A2440"}}>
        <div style={{fontSize:11,color:"#8A8172",marginBottom:4}}>มือ ({meP.hand.length}/10) · แตะเพื่อเล่น (เมนเฟส)</div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
          {meP.hand.map((c,i)=>(
            <HandCard key={c.uid} base={CARD[c.code]} playable={canCast(CARD[c.code])}
              onFront={()=>doPlayHero(i,"front")} onBack={()=>doPlayHero(i,"back")} onAction={()=>doPlayAction(i)}/>
          ))}
        </div>
      </div>

      <div style={LOG}>{(s.log||[]).map((l,i)=><div key={i} style={{opacity:i===0?1:.5}}>{l}</div>)}</div>
    </div>
  );
}

function Board({p,isMe,name,sel,pending,onHero,onKingdom,isMain,onSkill,onSwitch}){
  return (
    <div style={{...BOARD, ...(isMe?BME:BOPP)}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <button onClick={!isMe?onKingdom:undefined} style={{...KING, cursor:!isMe&&sel?"crosshair":"default"}}>
          <span style={{fontWeight:700,fontSize:12}}>{name} · Kingdom</span>
          <span style={{display:"flex",gap:3}}>{[0,1,2].map(i=><span key={i} style={{color:"#C8A24B",opacity:i<p.kingdom.shields?1:.18}}>◈</span>)}</span>
        </button>
        <div style={{fontSize:10,color:"#8A8172",textAlign:"right"}}>
          <div>เด็ค {p.deck.length} · สุสาน {p.grave.length}</div>
          <div>Cost {p.mana.filter(m=>m.faceUp).length}↑/{p.mana.length}</div>
        </div>
      </div>
      <Line title="Front" arr={p.front} isMe={isMe} back={false} sel={sel} pending={pending} onHero={onHero} isMain={isMain} onSkill={onSkill} onSwitch={onSwitch}/>
      <Line title="Back"  arr={p.back}  isMe={isMe} back={true}  sel={sel} pending={pending} onHero={onHero} isMain={isMain} onSkill={onSkill} onSwitch={onSwitch}/>
      {!isMe && <div style={{fontSize:10,color:"#8A8172"}}>มือ {p.hand.length} ใบ</div>}
    </div>
  );
}
function Line({title,arr,isMe,back,sel,pending,onHero,isMain,onSkill,onSwitch}){
  return (
    <div style={{display:"flex",gap:5,alignItems:"center"}}>
      <span style={{fontSize:9,color:"#6B6355",width:34,flexShrink:0}}>{title}</span>
      <div style={{display:"flex",gap:5,overflowX:"auto",minHeight:116,flex:1,padding:2,flexWrap:"wrap"}}>
        {arr.length===0 && <span style={{color:"#3A3550",fontSize:11}}>—</span>}
        {arr.map((h,i)=>{ const base=CARD[h.code]||{}; const buffed=(h.tAtk||h.tDef);
          const fb=(<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",padding:2}}><div style={{fontSize:9,fontWeight:700,textAlign:"center",lineHeight:1.05}}>{base.name}</div></div>);
          return (
          <div key={h.uid} style={{display:"flex",flexDirection:"column",gap:2}}>
            <button onClick={()=>onHero(isMe,back?"back":"front",h,i)}
              style={{...HERO, transform:h.rested?"rotate(90deg) scale(.82)":"none", outline:sel===h.uid?"2px solid #C8A24B":"none"}}>
              <Art art={base.art} fallback={fb} imgStyle={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",top:0,left:0,right:0,background:"linear-gradient(180deg,rgba(15,11,24,.9),transparent)",fontSize:8,fontWeight:700,padding:"2px 3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textShadow:"0 1px 2px #000"}}>{base.name}</div>
              <div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",justifyContent:"space-around",background:"rgba(15,11,24,.92)",fontSize:10,padding:"1px 0"}}>
                <span style={{color:"#E0894F"}}>⚔{(base.atk||0)+(h.tAtk||0)}{buffed?"*":""}</span>
                <span style={{color:"#6FA8DC"}}>🛡{(base.def||0)+(h.tDef||0)}</span>
                <span style={{color:"#C8A24B"}}>✦{base.cri}</span>
              </div>
            </button>
            {isMe && isMain && (
              <div style={{display:"flex",gap:2}}>
                {!h.switched && <button style={SW} onClick={(e)=>{e.stopPropagation();onSwitch(h);}}>{back?"→At":"→Df"}</button>}
                {base.eff?.skill && !h.rested && <button style={SK} onClick={(e)=>{e.stopPropagation();onSkill(h);}}>Sk({base.eff.skill.cost})</button>}
              </div>
            )}
          </div>
        );})}
      </div>
    </div>
  );
}
function HandCard({base,playable,onFront,onBack,onAction}){
  const isHero=base.type==="hero";
  const fb=(
    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",padding:5,gap:2}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9}}>
        <span style={{color:"#C8A24B",fontWeight:700}}>C{base.cost}</span><span style={{color:"#9A9080"}}>{isHero?`L${base.lvl}`:base.type==="item"?"Item":"Act"}</span>
      </div>
      <div style={{fontSize:9,fontWeight:700,lineHeight:1.1}}>{base.name}</div>
      {isHero && <div style={{display:"flex",gap:3,fontSize:9}}><span style={{color:"#E0894F"}}>⚔{base.atk}</span><span style={{color:"#6FA8DC"}}>🛡{base.def}</span><span style={{color:"#C8A24B"}}>✦{base.cri}</span></div>}
      <div style={{fontSize:7,color:"#8A8172",lineHeight:1.15,overflow:"hidden",flex:1}}>{base.text}</div>
    </div>
  );
  return (
    <div style={{...HC, opacity:playable?1:.55}}>
      <div style={{position:"relative",width:"100%",height:120,borderRadius:5,overflow:"hidden",background:"#14101f"}}>
        <Art art={base.art} fallback={fb} imgStyle={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",top:2,left:2,background:"rgba(15,11,24,.85)",color:"#C8A24B",fontWeight:800,fontSize:10,borderRadius:4,padding:"1px 5px"}}>C{base.cost}</div>
      </div>
      {playable && (isHero
        ? <div style={{display:"flex",gap:2,marginTop:3}}><button style={PB} onClick={onFront}>Front</button><button style={PB} onClick={onBack}>Back</button></div>
        : <button style={{...PB,marginTop:3}} onClick={onAction}>เล่น</button>)}
    </div>
  );
}
function Art({art,imgStyle,fallback}){
  const [broken,setBroken]=useState(false);
  if(broken||!art) return fallback;
  return <img src={artSrc(art)} alt="" onError={()=>setBroken(true)} style={imgStyle}/>;
}
const Center=({children})=>(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,color:"#E8DCC0",fontFamily:"Georgia,serif",background:"#0F0B18",textAlign:"center",padding:16}}>{children}</div>);

const I={padding:"11px 14px",borderRadius:6,border:"1px solid #3A3550",background:"#1a1626",color:"#E8DCC0",fontSize:16,textAlign:"center",width:"100%",maxWidth:280};
const B1={background:"linear-gradient(180deg,#C6472F,#8E2B2B)",color:"#E8DCC0",border:"none",padding:"12px 26px",fontSize:16,fontWeight:800,borderRadius:6,cursor:"pointer",width:"100%",maxWidth:280};
const B2={...B1,background:"linear-gradient(180deg,#3B6EA5,#2E5A7A)"};
const GH={background:"transparent",border:"1px solid #8A8172",color:"#B7AE9C",padding:"3px 12px",borderRadius:5,cursor:"pointer",fontFamily:"inherit",fontSize:11};
const HUD={display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"rgba(0,0,0,.3)",borderRadius:6,border:"1px solid #2A2440",fontSize:13};
const BOARD={border:"1px solid #2A2440",borderRadius:8,padding:7,display:"flex",flexDirection:"column",gap:5};
const BOPP={background:"linear-gradient(180deg,rgba(142,43,43,.14),transparent)"};
const BME={background:"linear-gradient(0deg,rgba(62,142,126,.12),transparent)"};
const KING={display:"flex",flexDirection:"column",gap:3,alignItems:"flex-start",background:"transparent",border:"none",color:"#E8DCC0",fontFamily:"inherit",padding:0};
const BAR={background:"rgba(0,0,0,.25)",borderRadius:6,padding:"6px 8px",border:"1px solid #2A2440"};
const NEXT={background:"linear-gradient(180deg,#8E2B2B,#6A1F1F)",color:"#E8DCC0",border:"none",padding:"8px 14px",fontSize:13,fontWeight:700,borderRadius:5,cursor:"pointer",fontFamily:"inherit"};
const HERO={position:"relative",width:80,height:108,background:"rgba(20,16,32,.92)",border:"1.5px solid #C6472F",borderRadius:5,padding:0,overflow:"hidden",color:"#E8DCC0",fontFamily:"inherit",flexShrink:0};
const SW={flex:1,background:"#2E5A7A",color:"#E8DCC0",border:"none",borderRadius:3,padding:"2px",fontSize:8,cursor:"pointer",fontFamily:"inherit",fontWeight:700};
const SK={flex:1,background:"#7A2E8A",color:"#E8DCC0",border:"none",borderRadius:3,padding:"2px",fontSize:8,cursor:"pointer",fontFamily:"inherit",fontWeight:700};
const HC={minWidth:94,maxWidth:94,background:"rgba(20,16,32,.95)",border:"1px solid #C8A24B",borderRadius:6,padding:5,display:"flex",flexDirection:"column",gap:2,flexShrink:0};
const PB={flex:1,background:"#3E8E7E",color:"#0F0B18",border:"none",borderRadius:3,padding:"3px",fontSize:9,cursor:"pointer",fontFamily:"inherit",fontWeight:800};
const MINI={background:"transparent",border:"1px solid #8A8172",color:"#B7AE9C",padding:"1px 8px",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit",marginLeft:6};
const LOG={background:"rgba(0,0,0,.3)",borderRadius:6,padding:"7px 9px",fontSize:11,maxHeight:80,overflowY:"auto",lineHeight:1.5,border:"1px solid #2A2440",fontFamily:"system-ui,sans-serif"};
