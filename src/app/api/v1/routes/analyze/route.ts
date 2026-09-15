import { NextResponse } from "next/server";
import { db, RouteAnalysis, RouteOption, generateAiRouteAnalysis } from "@/lib/db";

// Predefined maritime coordinates for waypoints
const PORT_COORDINATES: Record<string, { lat: number; lon: number }> = {
  mumbai: { lat: 19.076, lon: 72.8777 },
  singapore: { lat: 1.3521, lon: 103.8198 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  colombo: { lat: 6.9271, lon: 79.8612 },
  dubai: { lat: 25.2048, lon: 55.2708 },
  rotterdam: { lat: 51.9225, lon: 4.4792 },
  shanghai: { lat: 31.2304, lon: 121.4737 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
};

function getCoords(portName: string): { lat: number; lon: number } {
  const clean = portName.toLowerCase().split(/[\s,(]/)[0];
  for (const [key, coords] of Object.entries(PORT_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return { lat: 15.0, lon: 75.0 };
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const user = db.getUserByToken(authHeader);
    const userId = user ? user.id : "usr-captain-1";

    const body = await request.json();
    const { vessel_id, origin_port, destination_port, priority = "balanced" } = body;

    if (!origin_port || !destination_port) {
      return NextResponse.json(
        { detail: "origin_port and destination_port are required." },
        { status: 400 }
      );
    }

    const vessel = (vessel_id && db.vessels.get(vessel_id)) || Array.from(db.vessels.values())[0] || {
      id: "ves-default",
      name: "MV Horizon",
      vessel_type: "tanker",
      service_speed_knots: 15,
      fuel_consumption_tons_per_day: 30,
    };

    const originCoords = getCoords(origin_port);
    const destCoords = getCoords(destination_port);

    // Approximate nautical miles calculation
    const dLat = (destCoords.lat - originCoords.lat) * 60;
    const dLon = (destCoords.lon - originCoords.lon) * 60 * Math.cos(((destCoords.lat + originCoords.lat) / 2) * (Math.PI / 180));
    const rawDist = Math.sqrt(dLat * dLat + dLon * dLon);
    const baseDistance = Math.max(800, Math.round(rawDist * 1.35));

    const speed = vessel.service_speed_knots || 15;
    const baseFuelRate = vessel.fuel_consumption_tons_per_day || 30;

    const analysisId = "route-" + Date.now();

    // Generate waypoints helper
    const makeWaypoints = (offsetLat: number, offsetLon: number) => {
      const midLat = (originCoords.lat + destCoords.lat) / 2 + offsetLat;
      const midLon = (originCoords.lon + destCoords.lon) / 2 + offsetLon;
      return [
        { sequence: 1, lat: originCoords.lat, lon: originCoords.lon, reason: `Departure: ${origin_port}` },
        { sequence: 2, lat: (originCoords.lat + midLat) / 2, lon: (originCoords.lon + midLon) / 2, reason: "Outer Coastal Channel" },
        { sequence: 3, lat: midLat, lon: midLon, reason: "Deep Water Sea Corridor" },
        { sequence: 4, lat: (midLat + destCoords.lat) / 2, lon: (midLon + destCoords.lon) / 2, reason: "Fairway Ingress" },
        { sequence: 5, lat: destCoords.lat, lon: destCoords.lon, reason: `Arrival: ${destination_port}` },
      ];
    };

    const options: RouteOption[] = [
      {
        id: `${analysisId}-fast`,
        analysis_id: analysisId,
        route_type: "fastest",
        total_distance_nm: Math.round(baseDistance * 0.96),
        estimated_duration_hours: Math.round((baseDistance * 0.96) / (speed * 1.08)),
        total_fuel_tons: Math.round(((baseDistance * 0.96) / (speed * 1.08) / 24) * baseFuelRate * 1.15),
        fuel_cost_usd: Math.round(((baseDistance * 0.96) / (speed * 1.08) / 24) * baseFuelRate * 1.15 * 620),
        weather_risk_score: 24,
        is_recommended: priority === "fastest",
        waypoints: makeWaypoints(1.2, 0.8),
      },
      {
        id: `${analysisId}-bal`,
        analysis_id: analysisId,
        route_type: "balanced",
        total_distance_nm: baseDistance,
        estimated_duration_hours: Math.round(baseDistance / speed),
        total_fuel_tons: Math.round((baseDistance / speed / 24) * baseFuelRate),
        fuel_cost_usd: Math.round((baseDistance / speed / 24) * baseFuelRate * 600),
        weather_risk_score: 14,
        is_recommended: priority === "balanced" || (!["fastest", "cheapest", "safest"].includes(priority)),
        waypoints: makeWaypoints(0, 0),
      },
      {
        id: `${analysisId}-safe`,
        analysis_id: analysisId,
        route_type: "safest",
        total_distance_nm: Math.round(baseDistance * 1.08),
        estimated_duration_hours: Math.round((baseDistance * 1.08) / (speed * 0.92)),
        total_fuel_tons: Math.round(((baseDistance * 1.08) / (speed * 0.92) / 24) * baseFuelRate * 0.95),
        fuel_cost_usd: Math.round(((baseDistance * 1.08) / (speed * 0.92) / 24) * baseFuelRate * 0.95 * 600),
        weather_risk_score: 7,
        is_recommended: priority === "safest",
        waypoints: makeWaypoints(-1.8, -1.2),
      },
      {
        id: `${analysisId}-cheap`,
        analysis_id: analysisId,
        route_type: "cheapest",
        total_distance_nm: Math.round(baseDistance * 1.03),
        estimated_duration_hours: Math.round((baseDistance * 1.03) / (speed * 0.88)),
        total_fuel_tons: Math.round(((baseDistance * 1.03) / (speed * 0.88) / 24) * baseFuelRate * 0.82),
        fuel_cost_usd: Math.round(((baseDistance * 1.03) / (speed * 0.88) / 24) * baseFuelRate * 0.82 * 580),
        weather_risk_score: 18,
        is_recommended: priority === "cheapest",
        waypoints: makeWaypoints(0.5, -0.9),
      },
    ];

    const aiExplanation = await generateAiRouteAnalysis({
      origin: origin_port,
      destination: destination_port,
      vesselName: vessel.name,
      vesselType: vessel.vessel_type,
      priority,
    });

    const routeAnalysis: RouteAnalysis = {
      id: analysisId,
      user_id: userId,
      vessel_id: vessel.id,
      origin_port,
      destination_port,
      priority,
      status: "completed",
      ai_explanation: aiExplanation,
      created_at: new Date().toISOString(),
      options,
    };

    db.routes.set(analysisId, routeAnalysis);

    db.activities.unshift({
      id: "act-" + Date.now(),
      user_id: userId,
      type: "route_analyzed",
      description: `Route analyzed: ${origin_port} → ${destination_port}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(routeAnalysis, { status: 201 });
  } catch (err: any) {
    console.error("Route analysis error:", err);
    return NextResponse.json(
      { detail: err.message || "Failed to analyze route." },
      { status: 500 }
    );
  }
}
