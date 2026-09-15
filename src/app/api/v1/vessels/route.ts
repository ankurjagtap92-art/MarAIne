import { NextResponse } from "next/server";
import { db, Vessel } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const user = db.getUserByToken(authHeader);
  const userId = user ? user.id : "usr-captain-1";

  const userVessels = Array.from(db.vessels.values()).filter(
    (v) => v.user_id === userId
  );

  return NextResponse.json(userVessels);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const user = db.getUserByToken(authHeader);
    const userId = user ? user.id : "usr-captain-1";

    const body = await request.json();
    if (!body.name || !body.vessel_type) {
      return NextResponse.json(
        { detail: "Name and vessel_type are required." },
        { status: 400 }
      );
    }

    const newVessel: Vessel = {
      id: "ves-" + Date.now(),
      user_id: userId,
      name: body.name,
      imo_number: body.imo_number || undefined,
      vessel_type: body.vessel_type,
      service_speed_knots: body.service_speed_knots ? Number(body.service_speed_knots) : 14.5,
      fuel_consumption_tons_per_day: body.fuel_consumption_tons_per_day ? Number(body.fuel_consumption_tons_per_day) : 30.0,
      max_wave_height_meters: body.max_wave_height_meters ? Number(body.max_wave_height_meters) : 8.0,
      created_at: new Date().toISOString(),
    };

    db.vessels.set(newVessel.id, newVessel);

    // Record activity
    db.activities.unshift({
      id: "act-" + Date.now(),
      user_id: userId,
      type: "vessel_added",
      description: `Added vessel: ${newVessel.name}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(newVessel, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to create vessel." },
      { status: 500 }
    );
  }
}
