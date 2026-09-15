import { NextResponse } from "next/server";
import { db, User } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name, role, company_name } = body;

    const trimmedEmail = (email || "").trim().toLowerCase();
    const trimmedPassword = (password || "").trim();
    const trimmedName = (full_name || "").trim();

    if (!trimmedEmail || !trimmedPassword || !trimmedName) {
      return NextResponse.json(
        { detail: "Full name, email address, and password are required." },
        { status: 400 }
      );
    }

    if (db.users.has(trimmedEmail)) {
      return NextResponse.json(
        { detail: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: "usr-" + Date.now(),
      email: trimmedEmail,
      password: trimmedPassword,
      full_name: trimmedName,
      role: (role || "operator").trim(),
      company_name: (company_name || "Merchant Shipping Ltd").trim(),
      created_at: new Date().toISOString(),
    };

    db.users.set(newUser.email, newUser);
    db.users.set(newUser.id, newUser);

    const token = db.createToken(newUser);
    const { password: userPassword, ...userSafe } = newUser;
    void userPassword;

    return NextResponse.json({
      ...userSafe,
      user: userSafe,
      access_token: token,
      token_type: "bearer",
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Registration failed." },
      { status: 500 }
    );
  }
}
