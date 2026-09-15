import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const routes = Array.from(db.routes.values());

  const result = routes.map((r) => {
    const avgRisk =
      r.options.length > 0
        ? Math.round(
            r.options.reduce((acc, o) => acc + o.weather_risk_score, 0) /
              r.options.length
          )
        : 15;

    return {
      route_id: r.id,
      origin: r.origin_port,
      destination: r.destination_port,
      created_at: r.created_at,
      avg_risk_score: avgRisk,
    };
  });

  return NextResponse.json(result);
}
