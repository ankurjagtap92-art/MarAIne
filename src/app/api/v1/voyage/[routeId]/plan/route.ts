import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;
  const route = db.routes.get(routeId) || Array.from(db.routes.values())[0];

  if (!route) {
    return NextResponse.json({ detail: "Voyage plan not found" }, { status: 404 });
  }

  const selectedOption =
    route.options.find((o) => o.is_recommended) || route.options[0] || null;

  return NextResponse.json({
    route_id: route.id,
    origin_port: route.origin_port,
    destination_port: route.destination_port,
    selected_option: selectedOption,
    status: "planning",
    created_at: route.created_at,
  });
}
