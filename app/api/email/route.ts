import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { SITE_CONFIG } from '@/lib/constants'; // Merkezi sabitler eklendi

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 🛡️ KORUMA 1: JSON Parse Güvenliği
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Geçersiz JSON formatı gönderildi." }, { status: 400 });
    }

    const { userId, subject, type, data } = body;

    if (!userId) {
      return NextResponse.json({ error: "Kullanıcı ID'si gerekli" }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (authError) throw new Error(`Supabase Admin Hatası: ${authError.message}`);
    if (!authData.user?.email) throw new Error("Kullanıcı e-postası bulunamadı.");

    const userEmail = authData.user.email;

    let htmlContent = '';
    if (type === 'quote_ready') {
      // Marka adını (SITE_CONFIG.name) dinamik olarak ekledik
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">${SITE_CONFIG.name}</h2>
          <p>Merhaba,</p>
          <p><b>${data.projectName}</b> adlı 3D baskı talebiniz fiyatlandırıldı!</p>
          <p>Teklif Tutarı: <b>₺${data.price}</b></p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
          <p style="font-size: 12px; color: #888;">Bu e-posta ${SITE_CONFIG.company.name} sisteminden otomatik gönderilmiştir.</p>
        </div>
      `;
    }

    const { data: emailData, error: resendError } = await resend.emails.send({
      from: `${SITE_CONFIG.name} <onboarding@resend.dev>`, 
      to: [userEmail], 
      subject: subject,
      html: htmlContent,
    });

    if (resendError) throw new Error(`Resend Hatası: ${resendError.message}`);

    return NextResponse.json({ success: true, data: emailData });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}