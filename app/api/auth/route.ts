import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { USERS } from "@/middleware";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-for-dev-only-123");

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = USERS.find(u => u.username === username && u.password === password);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({ username: user.username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({ 
      success: true, 
      user: { 
        name: user.username, 
        nickname: user.nickname, 
        avatarIndex: user.avatarIndex 
      } 
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  (await cookies()).delete("auth-token");
  return NextResponse.json({ success: true });
}
