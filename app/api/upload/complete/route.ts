import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 🛡️ GÜVENLİK KONTROLÜ
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    if (!token) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ error: "Geçersiz oturum." }, { status: 401 });

    // --- ASIL İŞLEM ---
    const body = await req.json();
    const { requestId, filePath, filename, filesize, fileMime } = body;

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