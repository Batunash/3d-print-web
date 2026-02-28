import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId, subject, type, data } = await req.json();

    if (!userId) {
      console.log("❌ HATA: userId eksik geldi!");
      return NextResponse.json({ error: "Kullanıcı ID'si gerekli" }, { status: 400 });
    }

    console.log(`🔍 Kullanıcı aranıyor: ${userId}`);
    
    // 1. Supabase Admin ile kullanıcıyı bul
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (authError) {
      console.log("❌ SUPABASE ADMIN HATASI:", authError.message);
      throw new Error(`Supabase Admin Hatası: ${authError.message}`);
    }
    
    if (!authData.user?.email) {
      console.log("❌ HATA: Bu kullanıcının email adresi yok!");
      throw new Error("Kullanıcı e-postası bulunamadı.");
    }

    const userEmail = authData.user.email;
    console.log(`📧 E-posta bulundu: ${userEmail}. Resend'e gönderiliyor...`);

    let htmlContent = '';
    if (type === 'quote_ready') {
      htmlContent = `
        <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">PrintCraft 3D</h2>
          <p>Merhaba,</p>
          <p><b>${data.projectName}</b> adlı 3D baskı talebiniz fiyatlandırıldı!</p>
          <p>Teklif Tutarı: <b>₺${data.price}</b></p>
        </div>
      `;
    }

    // 2. Resend ile mail at
    const { data: emailData, error: resendError } = await resend.emails.send({
      from: 'PrintCraft 3D <onboarding@resend.dev>', 
      to: [userEmail], 
      subject: subject,
      html: htmlContent,
    });

    if (resendError) {
      console.log("❌ RESEND GÖNDERİM HATASI:", resendError.message);
      throw new Error(`Resend Hatası: ${resendError.message}`);
    }

    console.log("✅ E-Posta başarıyla gönderildi!");
    return NextResponse.json({ success: true, data: emailData });

  } catch (error: any) {
    console.error("🔥 API CATCH BLOĞU HATASI:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}