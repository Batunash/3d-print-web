import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 🛡️ GÜVENLİK 1: Çerezlerde (Cookies) giriş bileti var mı?
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    // 🛡️ GÜVENLİK 2: Bu bilet (token) gerçekten geçerli mi? (Sahte token kontrolü)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş oturum." }, { status: 401 });
    }

    // --- ASIL İŞLEM (Eğer güvenlikten geçerse) ---
    const body = await req.json();
    const { filename, requestId } = body;

    if (!filename || !requestId) {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    const fileExt = filename.split(".").pop();
    const allowed = ["stl", "obj", "3mf", "step", "stp", "iges", "igs", "blend", "f3d", "zip", "rar", "7z", "pdf", "png", "jpg", "jpeg"];

    if (!allowed.includes(fileExt?.toLowerCase())) {
      return NextResponse.json({ error: "Bu dosya türüne izin verilmiyor" }, { status: 400 });
    }

    const filePath = `requests/${requestId}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabaseAdmin.storage.from("uploads").createSignedUploadUrl(filePath);

    if (error) throw error;

    return NextResponse.json({ uploadUrl: data.signedUrl, filePath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}