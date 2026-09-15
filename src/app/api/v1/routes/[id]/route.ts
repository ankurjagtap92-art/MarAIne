import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const route = db.routes.get(id);

  if (!route) {
    // If not found, check if it's the first available route or return 404
    const firstRoute = Array.from(db.routes.values())[0];
    if (firstRoute) {
      return NextResponse.json({ ...firstRoute, id });
    }
    return NextResponse.json({ detail: "Route not found" }, { status: 404 });
  }

  return NextResponse.json(route);
}
