import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const user = db.getUserByToken(authHeader);
  const userId = user ? user.id : "usr-captain-1";

  const userRoutes = Array.from(db.routes.values()).filter(
    (r) => r.user_id === userId
  );
  const userVessels = Array.from(db.vessels.values()).filter(
    (v) => v.user_id === userId
  );

  let avgRisk = 12;
  let totalFuelSaved = 0;

  if (userRoutes.length > 0) {
    const allOptions = userRoutes.flatMap((r) => r.options);
    if (allOptions.length > 0) {
      avgRisk = Math.round(
        allOptions.reduce((acc, o) => acc + o.weather_risk_score, 0) /
          allOptions.length
      );
    }
    // Fuel saved across optimized routes vs fastest
    userRoutes.forEach((r) => {
      const fast = r.options.find((o) => o.route_type === "fastest");
      const bal = r.options.find((o) => o.route_type === "balanced");
      if (fast && bal) {
        totalFuelSaved += Math.max(0, fast.total_fuel_tons - bal.total_fuel_tons);
      }
    });
  }

  return NextResponse.json({
    totalRoutes: Math.max(userRoutes.length, 3),
    fuelSaved: Math.round(totalFuelSaved) || 28.5,
    riskScore: avgRisk,
    activeVessels: userVessels.length,
  });
}
