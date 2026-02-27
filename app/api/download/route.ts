import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 🛡️ GÜVENLİK 1: Giriş yapmış mı?
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ error: "Geçersiz oturum." }, { status: 401 });

    // 🛡️ GÜVENLİK 2: Bu kişi gerçekten ADMİN mi?
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Erişim reddedildi. Bu işlem için admin yetkisi gereklidir." }, { status: 403 });
    }

    // --- ASIL İŞLEM (Eğer güvenlikten geçerse) ---
    const { storagePath } = await req.json();

    if (!storagePath) {
      return NextResponse.json({ error: "Dosya yolu bulunamadı" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from("uploads")
      .createSignedUrl(storagePath, 300);

    if (error) throw error;

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}