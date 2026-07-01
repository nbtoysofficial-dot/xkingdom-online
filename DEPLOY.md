# X Kingdom Online — วิธี Deploy ให้เพื่อนเล่นมือถือ (Supabase + Vercel)

เป้าหมาย: ได้ลิงก์เว็บ (เช่น `xkingdom.vercel.app`) ที่เพื่อนเปิดในมือถือแล้วเล่นได้เลย
ไม่ต้องมีบัญชี Claude · realtime จริง

> แนะนำให้ทำขั้น deploy บน **คอมพิวเตอร์** จะง่ายกว่ามือถือมาก
> (เพื่อนใช้มือถือ "เล่น" ได้ แต่ตอน "สร้าง/deploy" ใช้คอมสะดวกกว่า)

---

## ส่วนที่ 1 — Supabase (ตั้งค่าเซิร์ฟเวอร์)

1. สมัคร/เข้า https://supabase.com → **New project**
   - ตั้งชื่อ, ตั้งรหัสผ่าน DB, เลือก Region = **Singapore**
2. รอสร้างเสร็จ (~2 นาที) → เมนูซ้าย **SQL Editor → New query**
   - เปิดไฟล์ `supabase/schema.sql` → คัดลอกทั้งหมด → วาง → **Run**
   - เห็น "Success" = ตารางพร้อม
3. เมนู **Authentication → Providers → Anonymous → เปิด (Enable)** → Save
   *(ข้อนี้สำคัญมาก ถ้าไม่เปิด จะสร้างห้องไม่ได้)*
4. เมนู **Project Settings → API** → จดค่า 2 ตัว:
   - **Project URL**
   - **anon public** key (ตัวยาว)

---

## ส่วนที่ 2 — เอาโค้ดขึ้น GitHub

1. สมัคร/เข้า https://github.com → **New repository** → ตั้งชื่อ เช่น `xkingdom-online` → Create
2. แตกไฟล์ zip ที่ผมส่งให้ → ในหน้า repo กด **Add file → Upload files**
   - ลากไฟล์ทั้งหมด (รวมโฟลเดอร์ `src`, `supabase`) เข้าไป → **Commit changes**
   - *อย่าอัป* โฟลเดอร์ `node_modules` และไฟล์ `.env` (มี `.gitignore` กันไว้แล้ว)

---

## ส่วนที่ 3 — Deploy บน Vercel

1. เข้า https://vercel.com → Sign up ด้วย GitHub
2. **Add New → Project → Import** repo `xkingdom-online`
3. Vercel จะรู้เองว่าเป็น Vite (Framework Preset = Vite)
4. กดเปิดหัวข้อ **Environment Variables** ใส่ 2 ตัว (จากส่วนที่ 1 ข้อ 4):
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Project URL ของคุณ |
   | `VITE_SUPABASE_ANON_KEY` | anon public key ของคุณ |
5. กด **Deploy** → รอสักครู่ → ได้ลิงก์ เช่น `https://xkingdom-online.vercel.app`

---

## ส่วนที่ 4 — ทดสอบกับเพื่อน

1. ส่งลิงก์ Vercel ให้เพื่อน 2 คนทาง Messenger
2. คนแรกเปิด → ใส่ชื่อ → **สร้างห้องใหม่** → ได้รหัส 4 ตัว → ส่งรหัสให้อีกคน
3. คนที่สองเปิดลิงก์เดียวกัน → ใส่รหัส → **เข้าห้อง** → เล่นได้เลย
4. เล่นบนมือถือได้ทุกเครื่อง ไม่ต้องมีบัญชีอะไรทั้งนั้น

---

## ถ้าติดปัญหา
- **สร้างห้องไม่ได้** → มักลืมเปิด Anonymous sign-ins (ส่วนที่ 1 ข้อ 3) หรือใส่ env ผิด/ไม่ครบใน Vercel
- **หน้าเว็บขาว/พัง** → เปิด Console (F12) ดู error แล้วส่งมาให้ผม
- **แก้ env ใน Vercel แล้วยังไม่เปลี่ยน** → ต้อง **Redeploy** (Vercel → Deployments → ... → Redeploy)

*(ตอนนี้เกมเป็นกติกาย่อเพื่อทดสอบระบบก่อน — พอเพื่อนเล่นผ่านแล้ว ขั้นต่อไปผมพอร์ตเอนจิน X Kingdom เต็ม 6 ธาตุเข้าไป โดยไม่ต้องแก้ระบบเน็ตเวิร์กเลย)*
