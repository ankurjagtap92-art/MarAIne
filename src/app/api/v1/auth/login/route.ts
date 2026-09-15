import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { detail: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = db.users.get(trimmedEmail);
    if (!user) {
      return NextResponse.json(
        { detail: "No account found with this email. Please check your credentials or create an account." },
        { status: 401 }
      );
    }

    if (user.password && user.password !== trimmedPassword) {
      return NextResponse.json(
        { detail: "Incorrect password. Please check your password and try again." },
        { status: 401 }
      );
    }

    const token = db.createToken(user);
    const { password: userPassword, ...userSafe } = user;
    void userPassword;

    return NextResponse.json({
      access_token: token,
      refresh_token: token + "_rf",
      token_type: "bearer",
      expires_in: 86400,
      user: userSafe,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Login failed." },
      { status: 500 }
    );
  }
}
