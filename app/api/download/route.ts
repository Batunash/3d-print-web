import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient"; // Merkezi istemci

export async function POST(req: Request) {
  try {
    // 🛡️ KORUMA 1: JSON Parse Güvenliği
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Geçersiz JSON formatı gönderildi." }, { status: 400 });
    }

    const { storagePath } = body;

    if (!storagePath) {
      return NextResponse.json({ error: "Dosya yolu bulunamadı" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ error: "Geçersiz oturum." }, { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Erişim reddedildi. Bu işlem için admin yetkisi gereklidir." }, { status: 403 });
    }

    // --- ASIL İŞLEM ---
    const { data, error } = await supabaseAdmin.storage
      .from("uploads")
      .createSignedUrl(storagePath, 300);

    if (error) throw error;

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}