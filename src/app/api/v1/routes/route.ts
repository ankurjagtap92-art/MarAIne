import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const user = db.getUserByToken(authHeader);
  const userId = user ? user.id : "usr-captain-1";

  const routes = Array.from(db.routes.values())
    .filter((r) => r.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return NextResponse.json(routes);
}
