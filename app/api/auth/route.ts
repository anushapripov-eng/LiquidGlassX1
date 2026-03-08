import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import * as crypto from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-for-dev-only-123"
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key for server-side
);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// POST /api/auth — login
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const passwordHash = hashPassword(password);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, nickname, avatar_index, password_hash")
      .eq("username", username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.password_hash !== passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({
      username: user.username,
      userId: user.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.username,
        nickname: user.nickname ?? user.username,
        avatarIndex: user.avatar_index ?? 0,
      },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/auth — logout
export async function DELETE() {
  (await cookies()).delete("auth-token");
  return NextResponse.json({ success: true });
}

// PUT /api/auth — register new user
export async function PUT(request: Request) {
  try {
    const { username, password, accountSize, avatarIndex } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const passwordHash = hashPassword(password);

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        username,
        password_hash: passwordHash,
        nickname: username,
        avatar_index: avatarIndex ?? 0,
      })
      .select()
      .single();

    if (error || !newUser) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Create default profile settings
    await supabase.from("profile_settings").insert({
      user_id: newUser.id,
      account_size: accountSize ?? 10000,
      accent_color: "blue",
    });

    // Create default rules for new user
    const defaultRules = [
      "Only trade after 11:00 Dubai time (GMT+4)",
      "Close all positions by 22:00 Dubai time",
      "Maximum 1 trade per day",
      "Use 15-minute chart for analysis",
      "Weekly goal: +2% on account",
      "1 profitable trade per week = week is done",
    ];

    await supabase.from("rules").insert(
      defaultRules.map((text, i) => ({
        user_id: newUser.id,
        text,
        sort_order: i,
      }))
    );

    const token = await new SignJWT({
      username: newUser.username,
      userId: newUser.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.username,
        nickname: newUser.nickname,
        avatarIndex: newUser.avatar_index ?? 0,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}