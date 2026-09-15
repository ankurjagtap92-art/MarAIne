// In-memory data store for SeaVision (Node.js runtime)
import { GoogleGenAI } from "@google/genai";

export interface User {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: string;
  company_name?: string;
  created_at: string;
}

export interface Vessel {
  id: string;
  user_id: string;
  name: string;
  imo_number?: string;
  vessel_type: string;
  service_speed_knots?: number;
  fuel_consumption_tons_per_day?: number;
  max_wave_height_meters?: number;
  created_at: string;
}

export interface Waypoint {
  sequence: number;
  lat: number;
  lon: number;
  reason?: string;
}

export interface RouteOption {
  id: string;
  analysis_id: string;
  route_type: "fastest" | "cheapest" | "safest" | "balanced";
  total_distance_nm: number;
  estimated_duration_hours: number;
  total_fuel_tons: number;
  fuel_cost_usd: number;
  weather_risk_score: number;
  is_recommended: boolean;
  waypoints: Waypoint[];
}

export interface RouteAnalysis {
  id: string;
  user_id: string;
  vessel_id: string;
  origin_port: string;
  destination_port: string;
  priority: string;
  status: string;
  ai_explanation?: string;
  created_at: string;
  options: RouteOption[];
}

export interface Port {
  id: string;
  name: string;
  code: string;
  lat: number;
  lon: number;
  country: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: "route_analyzed" | "vessel_added";
  description: string;
  created_at: string;
}

// Global in-memory singleton to preserve state across requests
class InMemoryStore {
  users: Map<string, User> = new Map();
  vessels: Map<string, Vessel> = new Map();
  routes: Map<string, RouteAnalysis> = new Map();
  ports: Port[] = [];
  activities: Activity[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // Default demo user
    const defaultUser: User = {
      id: "usr-captain-1",
      email: "captain@fleet.com",
      password: "password123",
      full_name: "Captain Smith",
      role: "operator",
      company_name: "Oceanic Fleet Logistics",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
    this.users.set(defaultUser.email.toLowerCase(), defaultUser);
    this.users.set(defaultUser.id, defaultUser);

    const directorUser: User = {
      id: "usr-director-1",
      email: "director@maraine.io",
      password: "password123",
      full_name: "Elena Rostova",
      role: "fleet_manager",
      company_name: "Pacific Global Maritime",
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    };
    this.users.set(directorUser.email.toLowerCase(), directorUser);
    this.users.set(directorUser.id, directorUser);

    // Default vessels
    const seedVessels: Vessel[] = [
      {
        id: "ves-1",
        user_id: defaultUser.id,
        name: "MV Horizon",
        imo_number: "9412345",
        vessel_type: "tanker",
        service_speed_knots: 15.5,
        fuel_consumption_tons_per_day: 32.0,
        max_wave_height_meters: 8.5,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: "ves-2",
        user_id: defaultUser.id,
        name: "MV Star",
        imo_number: "9823456",
        vessel_type: "container_ship",
        service_speed_knots: 18.0,
        fuel_consumption_tons_per_day: 46.5,
        max_wave_height_meters: 9.0,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: "ves-3",
        user_id: defaultUser.id,
        name: "MV Ocean",
        imo_number: "9134567",
        vessel_type: "bulk_carrier",
        service_speed_knots: 13.5,
        fuel_consumption_tons_per_day: 28.0,
        max_wave_height_meters: 7.5,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ];
    seedVessels.forEach((v) => this.vessels.set(v.id, v));

    // Default Ports
    this.ports = [
      { id: "p-1", name: "Mumbai", code: "INBOM", lat: 19.076, lon: 72.8777, country: "India" },
      { id: "p-2", name: "Singapore", code: "SGSIN", lat: 1.3521, lon: 103.8198, country: "Singapore" },
      { id: "p-3", name: "Chennai", code: "INMAA", lat: 13.0827, lon: 80.2707, country: "India" },
      { id: "p-4", name: "Colombo", code: "LKCMB", lat: 6.9271, lon: 79.8612, country: "Sri Lanka" },
      { id: "p-5", name: "Dubai", code: "AEDXB", lat: 25.2048, lon: 55.2708, country: "UAE" },
      { id: "p-6", name: "Rotterdam", code: "NLRTM", lat: 51.9225, lon: 4.4792, country: "Netherlands" },
      { id: "p-7", name: "Shanghai", code: "CNSHA", lat: 31.2304, lon: 121.4737, country: "China" },
      { id: "p-8", name: "Tokyo", code: "JPTYO", lat: 35.6762, lon: 139.6503, country: "Japan" },
    ];

    // Seed Route 1
    const r1Id = "route-1";
    const r1Options: RouteOption[] = [
      {
        id: "opt-1-fast",
        analysis_id: r1Id,
        route_type: "fastest",
        total_distance_nm: 2420,
        estimated_duration_hours: 156,
        total_fuel_tons: 208,
        fuel_cost_usd: 124800,
        weather_risk_score: 22,
        is_recommended: false,
        waypoints: [
          { sequence: 1, lat: 19.076, lon: 72.8777, reason: "Departure Port (Mumbai)" },
          { sequence: 2, lat: 15.0, lon: 73.0, reason: "Arabian Sea Coastal Channel" },
          { sequence: 3, lat: 10.5, lon: 75.5, reason: "Laccadive Sea Waypoint" },
          { sequence: 4, lat: 5.5, lon: 80.5, reason: "South of Sri Lanka Corridor" },
          { sequence: 5, lat: 4.5, lon: 92.0, reason: "Nicobar Strait Passage" },
          { sequence: 6, lat: 4.0, lon: 98.0, reason: "Malacca Strait Ingress" },
          { sequence: 7, lat: 1.3521, lon: 103.8198, reason: "Arrival Port (Singapore)" },
        ],
      },
      {
        id: "opt-1-bal",
        analysis_id: r1Id,
        route_type: "balanced",
        total_distance_nm: 2450,
        estimated_duration_hours: 165,
        total_fuel_tons: 192,
        fuel_cost_usd: 115200,
        weather_risk_score: 14,
        is_recommended: true,
        waypoints: [
          { sequence: 1, lat: 19.076, lon: 72.8777, reason: "Departure Port (Mumbai)" },
          { sequence: 2, lat: 14.8, lon: 73.2, reason: "Optimal Fuel Eco Speed Zone" },
          { sequence: 3, lat: 9.8, lon: 76.0, reason: "Calm Water Corridor" },
          { sequence: 4, lat: 5.2, lon: 81.0, reason: "Sri Lanka Bypass" },
          { sequence: 5, lat: 4.6, lon: 92.5, reason: "Bay of Bengal Deep Sea" },
          { sequence: 6, lat: 3.8, lon: 98.5, reason: "Malacca Strait Fairway" },
          { sequence: 7, lat: 1.3521, lon: 103.8198, reason: "Arrival Port (Singapore)" },
        ],
      },
      {
        id: "opt-1-safe",
        analysis_id: r1Id,
        route_type: "safest",
        total_distance_nm: 2510,
        estimated_duration_hours: 172,
        total_fuel_tons: 200,
        fuel_cost_usd: 120000,
        weather_risk_score: 8,
        is_recommended: false,
        waypoints: [
          { sequence: 1, lat: 19.076, lon: 72.8777, reason: "Departure Port (Mumbai)" },
          { sequence: 2, lat: 14.0, lon: 72.5, reason: "Low Swell Coastal Route" },
          { sequence: 3, lat: 8.5, lon: 76.5, reason: "Storm Avoidance Zone" },
          { sequence: 4, lat: 4.8, lon: 82.0, reason: "Deep Water Safety Vector" },
          { sequence: 5, lat: 4.0, lon: 93.0, reason: "Weather Clear Waypoint" },
          { sequence: 6, lat: 3.5, lon: 99.0, reason: "Piloted Malacca Lane" },
          { sequence: 7, lat: 1.3521, lon: 103.8198, reason: "Arrival Port (Singapore)" },
        ],
      },
      {
        id: "opt-1-cheap",
        analysis_id: r1Id,
        route_type: "cheapest",
        total_distance_nm: 2470,
        estimated_duration_hours: 180,
        total_fuel_tons: 178,
        fuel_cost_usd: 106800,
        weather_risk_score: 18,
        is_recommended: false,
        waypoints: [
          { sequence: 1, lat: 19.076, lon: 72.8777, reason: "Departure Port (Mumbai)" },
          { sequence: 2, lat: 14.5, lon: 73.0, reason: "Current-Assisted Route" },
          { sequence: 3, lat: 9.0, lon: 76.2, reason: "Low RPM Economic Cruise" },
          { sequence: 4, lat: 5.0, lon: 81.5, reason: "Equatorial Current Lane" },
          { sequence: 5, lat: 4.2, lon: 93.0, reason: "Direct Geodesic Track" },
          { sequence: 6, lat: 3.6, lon: 99.0, reason: "Malacca Economic Approach" },
          { sequence: 7, lat: 1.3521, lon: 103.8198, reason: "Arrival Port (Singapore)" },
        ],
      },
    ];

    const r1: RouteAnalysis = {
      id: r1Id,
      user_id: defaultUser.id,
      vessel_id: "ves-1",
      origin_port: "Mumbai",
      destination_port: "Singapore",
      priority: "balanced",
      status: "completed",
      ai_explanation:
        "Recommendation: The Balanced route optimizes fuel efficiency while avoiding seasonal monsoonal chop south of Dondra Head, saving approximately 16 tons of fuel compared to the direct high-speed trajectory.",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      options: r1Options,
    };
    this.routes.set(r1.id, r1);

    // Initial activities
    this.activities = [
      {
        id: "act-1",
        user_id: defaultUser.id,
        type: "route_analyzed",
        description: "Route analyzed: Mumbai → Singapore",
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: "act-2",
        user_id: defaultUser.id,
        type: "vessel_added",
        description: "Added vessel: MV Horizon",
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
      {
        id: "act-3",
        user_id: defaultUser.id,
        type: "vessel_added",
        description: "Added vessel: MV Star",
        created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      },
    ];
  }

  // Auth Helpers
  getUserByToken(token: string | null): User | null {
    if (!token) return null;
    const cleaned = token.replace(/^Bearer\s+/i, "");
    if (cleaned.startsWith("tok_")) {
      const email = Buffer.from(cleaned.slice(4), "base64").toString("utf-8");
      return this.users.get(email.toLowerCase()) || null;
    }
    // Fallback: default user
    return this.users.get("usr-captain-1") || null;
  }

  createToken(user: User): string {
    return "tok_" + Buffer.from(user.email.toLowerCase()).toString("base64");
  }
}

// Global declaration for hot-reloads
const globalForDb = global as unknown as { inMemoryStore?: InMemoryStore };
export const db = globalForDb.inMemoryStore || new InMemoryStore();
if (process.env.NODE_ENV !== "production") {
  globalForDb.inMemoryStore = db;
}

// AI Route Analysis Helper
export async function generateAiRouteAnalysis(params: {
  origin: string;
  destination: string;
  vesselName: string;
  vesselType: string;
  priority: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `Analysis for ${params.origin} → ${params.destination} (${params.vesselName}, ${params.priority} priority): Optimal maritime corridor avoids current seasonal swells. Balanced route yields an estimated 10-14% reduction in fuel consumption while maintaining schedule reliability.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a maritime route routing specialist for commercial shipping.
Provide a concise 2-sentence navigational analysis for a commercial voyage from ${params.origin} to ${params.destination} with a ${params.vesselType} vessel (${params.vesselName}) optimizing for ${params.priority}. Mention prevailing sea conditions, fuel conservation strategies, and routing risk recommendations.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return (
      response.text ||
      `Route analysis generated for ${params.origin} to ${params.destination}. Recommended sea lane accounts for current weather and speed optimizations.`
    );
  } catch (err) {
    console.warn("Gemini generation fallback:", err);
    return `Route analysis for ${params.origin} to ${params.destination}: Recommended path balances oceanic currents and avoids high-wave regions near coastline turns.`;
  }
}
