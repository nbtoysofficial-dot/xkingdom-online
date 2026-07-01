# X Kingdom Online — คู่มือ Setup (Supabase + Vercel)

สตาร์ทเตอร์คิตนี้ทำให้เกมเล่นออนไลน์แบบ **realtime จริง** (push ทันที ไม่ใช่ poll),
reconnect ได้ (สถานะอยู่ในดาต้าเบส), และรองรับหลายห้องพร้อมกัน

---

## สิ่งที่คุณต้องทำเอง (ผมทำให้ไม่ได้เพราะเป็นบัญชี/คีย์ส่วนตัว)
1. สร้างบัญชี Supabase (ฟรี) และโปรเจกต์
2. เอา URL + anon key มาใส่ในโปรเจกต์
3. deploy ขึ้น Vercel

ที่เหลือ (สคีมา, โค้ดเน็ตเวิร์ก, ตัวอย่างต่อสาย) อยู่ในคิตนี้ครบแล้ว

---

## ขั้นตอน

### 1) สร้างโปรเจกต์ Supabase
- ไป https://supabase.com → New project → ตั้งชื่อ, ตั้งรหัสผ่าน DB, เลือก region ใกล้ไทย (เช่น Singapore)

### 2) สร้างตาราง + กฎความปลอดภัย
- เปิด **SQL Editor → New query** → วางเนื้อหาไฟล์ `supabase/schema.sql` ทั้งหมด → **Run**
- ตารางนี้ใช้ RLS ปิดกั้นให้ **แก้ไขห้องได้เฉพาะผู้เล่น 2 คนในห้อง**

### 3) เปิด Anonymous sign-ins
- **Authentication → Providers → Anonymous** → เปิด
- (แต่ละเบราว์เซอร์จะได้ uid ของตัวเอง ใช้ระบุ "ที่นั่ง" ผู้เล่นและบังคับสิทธิ์การเขียน)

### 4) เอาคีย์มาใส่
- **Project Settings → API** → คัดลอก **Project URL** และ **anon public key**
- ในโปรเจกต์เว็บของคุณ สร้างไฟล์ `.env` (หรือ `.env.local`):
  - Vite:  `VITE_SUPABASE_URL=...` และ `VITE_SUPABASE_ANON_KEY=...`
  - Next:  `NEXT_PUBLIC_SUPABASE_URL=...` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- (หรือแก้ค่าตรงๆ ใน `src/lib/supabaseClient.js` ก็ได้ตอนทดสอบ)

### 5) ติดตั้งไลบรารีและวางไฟล์
```bash
npm install @supabase/supabase-js
```
วางไฟล์จากคิตนี้ลงในโปรเจกต์:
```
src/lib/supabaseClient.js
src/hooks/useOnlineGame.js
src/components/OnlineGame.jsx   ← ตัวอย่างต่อสาย (กติกาย่อ) ไว้ทดสอบ
```
เรียกใช้ `<OnlineGame />` ที่หน้าไหนก็ได้

### 6) ทดสอบว่า realtime ทำงาน
- รัน `npm run dev` เปิด 2 แท็บ/2 เครื่อง
- แท็บ A: สร้างห้อง → ได้รหัส
- แท็บ B: ใส่รหัส → เข้าห้อง
- ผลัดกันเล่น — ควรเห็นการเปลี่ยนแปลง **แทบจะทันที** (ไม่ใช่หน่วง 2 วิแบบเดโมเก่า)

### 7) deploy ขึ้น Vercel
- push โค้ดขึ้น GitHub → import ใน Vercel
- ใส่ Environment Variables เดียวกัน (URL + anon key) ใน Vercel → Settings → Environment Variables
- Deploy เสร็จได้ลิงก์ ส่งให้เพื่อนเล่นได้เลย

---

## โครงสร้างคิต
| ไฟล์ | หน้าที่ |
|------|---------|
| `supabase/schema.sql` | ตาราง `games` + RLS + เปิด realtime |
| `src/lib/supabaseClient.js` | เชื่อม Supabase + ล็อกอิน anonymous |
| `src/hooks/useOnlineGame.js` | สร้าง/เข้าห้อง, subscribe realtime, commit สถานะ |
| `src/components/OnlineGame.jsx` | ตัวอย่างต่อสายพร้อมใช้ (กติกาย่อ) |

---

## ต่อเอนจิน X Kingdom เต็มยังไง
เอนจินเต็ม (v0.2 + 6 ธาตุ + สลับไลน์ + สถานะ) ให้เก็บสถานะทั้งหมดไว้ในก้อน **`room.state`** (JSONB)
- render กระดานจาก `room.state`
- เวลาผู้เล่นทำแอ็กชัน → คำนวณ state ใหม่ → เรียก `commit({ state: newState, turn, status, winner })`
- hook จัดการ push/รับ realtime ให้อีกฝ่ายเห็นทันที

`useOnlineGame` ไม่ผูกกับกติกาใดๆ — ออกแบบมาให้เสียบเอนจินอะไรก็ได้

---

## หมายเหตุด้านความปลอดภัย (สำคัญ)
เวอร์ชันนี้เป็น **client-authoritative** — ไคลเอนต์คำนวณสถานะเองแล้วเขียนลง DB
RLS ปิดกั้นให้ **เฉพาะผู้เล่น 2 คนในห้อง** เขียนได้ (คนนอกยุ่งไม่ได้)
แต่ผู้เล่นในห้องที่ตั้งใจโกงยังเขียนสถานะที่ผิดกติกาได้ในทางทฤษฎี

พอถึงจุดที่ต้องกันโกงจริงจัง (เช่นมีจัดอันดับ/แข่งขัน) ขั้นถัดไปคือย้ายการ "ตัดสินกติกา"
ไปไว้ฝั่งเซิร์ฟเวอร์ด้วย **Supabase Edge Function** (ไคลเอนต์ส่งแค่ "การกระทำ" เซิร์ฟเวอร์เป็นคนคำนวณ state)
— เล่นกับเพื่อนตอนนี้ยังไม่จำเป็น แต่วางสถาปัตยกรรมไว้ให้ต่อยอดได้
