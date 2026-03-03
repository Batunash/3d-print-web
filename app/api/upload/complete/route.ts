import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient"; // Merkezi client kullanımına geçtik

export async function POST(req: Request) {
  try {
    // 🛡️ KORUMA 1: JSON Parse Güvenliği
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Geçersiz JSON formatı gönderildi." }, { status: 400 });
    }

    const { requestId, filePath, filename, filesize, fileMime } = body;

    if (!requestId || !filePath || !filename) {
      return NextResponse.json({ error: "Eksik veri gönderildi." }, { status: 400 });
    }

    // 🛡️ KORUMA 2: Oturum Kontrolü
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ error: "Geçersiz oturum." }, { status: 401 });

    // 🛡️ KORUMA 3 (Kritik IDOR Koruması): Bu sipariş gerçekten bu kullanıcıya mı ait?
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from("print_requests")
      .select("user_id")
      .eq("id", requestId)
      .single();

    if (requestError || !requestData || requestData.user_id !== user.id) {
      return NextResponse.json({ error: "Güvenlik İhlali: Bu işleme yetkiniz yok." }, { status: 403 });
    }

    // --- ASIL İŞLEM ---
    const { error } = await supabaseAdmin.from("files").insert({
      request_id: requestId,
      storage_path: filePath,
      filename,
      filesize,
      file_mime: fileMime,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}