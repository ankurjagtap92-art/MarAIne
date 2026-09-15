import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vessel = db.vessels.get(id);
  if (!vessel) {
    return NextResponse.json({ detail: "Vessel not found" }, { status: 404 });
  }
  return NextResponse.json(vessel);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vessel = db.vessels.get(id);
    if (!vessel) {
      return NextResponse.json({ detail: "Vessel not found" }, { status: 404 });
    }

    const body = await request.json();
    const updated = {
      ...vessel,
      name: body.name !== undefined ? body.name : vessel.name,
      imo_number: body.imo_number !== undefined ? body.imo_number : vessel.imo_number,
      vessel_type: body.vessel_type !== undefined ? body.vessel_type : vessel.vessel_type,
      service_speed_knots:
        body.service_speed_knots !== undefined
          ? Number(body.service_speed_knots)
          : vessel.service_speed_knots,
      fuel_consumption_tons_per_day:
        body.fuel_consumption_tons_per_day !== undefined
          ? Number(body.fuel_consumption_tons_per_day)
          : vessel.fuel_consumption_tons_per_day,
      max_wave_height_meters:
        body.max_wave_height_meters !== undefined
          ? Number(body.max_wave_height_meters)
          : vessel.max_wave_height_meters,
    };

    db.vessels.set(id, updated);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "Failed to update vessel." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!db.vessels.has(id)) {
    return NextResponse.json({ detail: "Vessel not found" }, { status: 404 });
  }
  db.vessels.delete(id);
  return NextResponse.json({ message: "Vessel deleted successfully" });
}
