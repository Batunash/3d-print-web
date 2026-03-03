import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient"; // Merkezi client kullanımına geçtik
import { ALLOWED_FILE_TYPES } from "@/lib/constants";
export async function POST(req: Request) {
  try {
    // 🛡️ KORUMA 1: JSON Parse Güvenliği (Çökme Koruması)
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Geçersiz JSON formatı gönderildi." }, { status: 400 });
    }

    const { filename, requestId } = body;

    if (!filename || !requestId) {
      return NextResponse.json({ error: "Geçersiz istek: filename ve requestId zorunludur." }, { status: 400 });
    }

    // 🛡️ KORUMA 2: Çerezlerde (Cookies) giriş bileti var mı?
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş oturum." }, { status: 401 });
    }

    // 🛡️ KORUMA 3 (Kritik IDOR Koruması): Bu sipariş gerçekten bu kullanıcıya mı ait?
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from("print_requests")
      .select("user_id")
      .eq("id", requestId)
      .single();

    if (requestError || !requestData) {
      return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
    }

    if (requestData.user_id !== user.id) {
      return NextResponse.json({ error: "Güvenlik İhlali: Bu sipariş size ait değil." }, { status: 403 });
    }

    // --- ASIL İŞLEM (Tüm güvenlik duvarları aşıldıysa) ---
    const fileExt = filename.split(".").pop();
    if (!ALLOWED_FILE_TYPES.includes(fileExt?.toLowerCase() || "")) {
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