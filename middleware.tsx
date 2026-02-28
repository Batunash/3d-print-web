import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Kullanıcının tarayıcısındaki çerezlerde (cookies) oturum anahtarı var mı?
  const session = req.cookies.get("sb-access-token");

  // Hem /dashboard hem de /admin rotalarını koruma altına alıyoruz
  const isProtectedPath = req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/admin");

  if (!session && isProtectedPath) {
    // Session yoksa zorla login sayfasına yönlendir
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}