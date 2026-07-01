// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

/*
  ใส่ค่า 2 ตัวนี้จาก Supabase Dashboard → Project Settings → API:
   - Project URL
   - anon public key   (ปลอดภัยที่จะอยู่ฝั่ง client — การป้องกันจริงอยู่ที่ RLS)

  แนะนำให้ใช้ Environment Variables แทนการฮาร์ดโค้ด:
   • Vite  :  import.meta.env.VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
   • Next  :  process.env.NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
   • CRA   :  process.env.REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY
*/

const URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL)) ||
  "PASTE_YOUR_SUPABASE_URL";

const ANON =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY)) ||
  "PASTE_YOUR_ANON_KEY";

export const supabase = createClient(URL, ANON, {
  realtime: { params: { eventsPerSecond: 10 } },
});

// ล็อกอินแบบ anonymous (แต่ละเบราว์เซอร์ได้ uid ของตัวเอง ใช้ระบุ "ที่นั่ง" ผู้เล่น)
// ต้องเปิด: Dashboard → Authentication → Providers → เปิด "Anonymous sign-ins"
export async function ensureAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user;
}
