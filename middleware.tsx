import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Kullanıcının tarayıcısındaki çerezlerde (cookies) oturum anahtarı var mı diye bakıyoruz
  const session = req.cookies.get("sb-access-token");

  // Eğer session yoksa VE kullanıcı /dashboard ile başlayan bir yere girmeye çalışıyorsa:
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    // Onu zorla login sayfasına yönlendir
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Sorun yoksa veya korumalı bir rotada değilse, gitmek istediği yere gitmesine izin ver
  return NextResponse.next();
}

// Performans için: Middleware'in sadece hangi sayfalarda çalışacağını belirtiyoruz
export const config = {
  matcher: ['/dashboard/:path*'],
};