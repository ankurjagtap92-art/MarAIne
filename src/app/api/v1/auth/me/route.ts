import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const user = db.getUserByToken(authHeader);
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { password: userPassword, ...userSafe } = user;
  void userPassword;
  return NextResponse.json(userSafe);
}
