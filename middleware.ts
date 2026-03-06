import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-for-dev-only-123");

export const USERS = [
  { username: "Anush", password: "Anu$hervon2010$", nickname: "Anush", avatarIndex: 0 },
  { username: "admin", password: "Admin$", nickname: "Admin", avatarIndex: 7 }
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (pathname === "/login" || pathname.startsWith("/api/auth") || pathname === "/api/test-telegram") {
    return NextResponse.next();
  }

  const token = (await cookies()).get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
