"""
Route Engine – AI-powered route optimization
Uses Gemini and OpenWeatherMap to generate real route options.
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini (if API key exists)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
else:
    print("⚠️ WARNING: GEMINI_API_KEY not set – using mock only.")
    model = None


def get_weather(lat: float, lon: float) -> Dict:
    """Fetch current weather for a location from OpenWeatherMap."""
    api_key = os.getenv("OPENWEATHERMAP_API_KEY")
    if not api_key:
        return {"main": {"temp": 25}, "wind": {"speed": 5}, "weather": [{"description": "Unknown"}]}
    
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": api_key,
        "units": "metric"
    }
    try:
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code == 200:
            return resp.json()
    except:
        pass
    return {"main": {"temp": 25}, "wind": {"speed": 5}, "weather": [{"description": "Unknown"}]}


def generate_mock_options(vessel, priority):
    """Fallback mock options if AI API fails."""
    base_distance = 1500
    base_fuel = vessel.fuel_consumption_tons_per_day or 30
    base_speed = vessel.service_speed_knots or 14

    options = [
        {
            "route_type": "fastest",
            "distance": round(base_distance * 0.95, 1),
            "time": f"{base_distance*0.95/(base_speed*1.1):.1f} hours",
            "fuel": round(base_fuel * 0.9, 1),
            "cost": round(base_fuel * 0.9 * 600, 2),
            "risk": 15,
            "explanation": "Optimized for speed with minimal weather deviation.",
            "waypoints": [
                {"sequence": 1, "lat": 10.0, "lon": 20.0, "reason": "Origin"},
                {"sequence": 2, "lat": 15.0, "lon": 25.0, "reason": "Midpoint"},
                {"sequence": 3, "lat": 20.0, "lon": 30.0, "reason": "Destination"}
            ]
        },
        {
            "route_type": "cheapest",
            "distance": round(base_distance * 1.05, 1),
            "time": f"{base_distance*1.05/(base_speed*0.9):.1f} hours",
            "fuel": round(base_fuel * 0.8, 1),
            "cost": round(base_fuel * 0.8 * 550, 2),
            "risk": 20,
            "explanation": "Slower speed to save fuel, longer route avoids high-cost zones.",
            "waypoints": [
                {"sequence": 1, "lat": 10.5, "lon": 20.5, "reason": "Origin"},
                {"sequence": 2, "lat": 15.5, "lon": 25.5, "reason": "Midpoint"},
                {"sequence": 3, "lat": 20.0, "lon": 30.0, "reason": "Destination"}
            ]
        },
        {
            "route_type": "safest",
            "distance": round(base_distance * 1.10, 1),
            "time": f"{base_distance*1.10/(base_speed*0.85):.1f} hours",
            "fuel": round(base_fuel * 1.0, 1),
            "cost": round(base_fuel * 1.0 * 620, 2),
            "risk": 10,
            "explanation": "Avoids storm areas and reduces risk of parametric rolling.",
            "waypoints": [
                {"sequence": 1, "lat": 9.5, "lon": 19.5, "reason": "Origin"},
                {"sequence": 2, "lat": 14.5, "lon": 24.5, "reason": "Midpoint"},
                {"sequence": 3, "lat": 20.0, "lon": 30.0, "reason": "Destination"}
            ]
        },
        {
            "route_type": "balanced",
            "distance": round(base_distance * 1.0, 1),
            "time": f"{base_distance/base_speed:.1f} hours",
            "fuel": round(base_fuel * 0.95, 1),
            "cost": round(base_fuel * 0.95 * 600, 2),
            "risk": 12,
            "explanation": "Optimized balance of speed and cost.",
            "waypoints": [
                {"sequence": 1, "lat": 10.2, "lon": 20.2, "reason": "Origin"},
                {"sequence": 2, "lat": 15.2, "lon": 25.2, "reason": "Midpoint"},
                {"sequence": 3, "lat": 20.0, "lon": 30.0, "reason": "Destination"}
            ]
        }
    ]
    
    return {
        "options": options,
        "explanation": f"Mock route options generated. Based on your vessel's speed ({vessel.service_speed_knots} knots) and fuel consumption ({vessel.fuel_consumption_tons_per_day} tons/day), we generated 4 route options. The {priority} option is recommended."
    }


def generate_route_options(vessel, origin: str, destination: str, priority: str) -> Dict[str, Any]:
    """
    Generate 4 route options using Gemini AI (if available) or mock fallback.
    Returns: {"options": [...], "explanation": "..."}
    """
    try:
        # If model is not configured (no API key), skip AI and use mock.
        if model is None:
            print("⚠️ Skipping AI – using mock fallback.")
            return generate_mock_options(vessel, priority)

        # Fetch weather (using dummy coordinates – in production, use real port data)
        origin_lat, origin_lon = 10.0, 20.0
        dest_lat, dest_lon = 20.0, 30.0

        origin_weather = get_weather(origin_lat, origin_lon)
        dest_weather = get_weather(dest_lat, dest_lon)

        # Build the prompt for Gemini
        prompt = f"""You are a maritime route optimization expert. Given the following vessel and route details, provide four route options: fastest, cheapest, safest, and balanced.

Vessel:
- Name: {vessel.name}
- Type: {vessel.vessel_type}
- Service speed: {vessel.service_speed_knots or 14} knots
- Fuel consumption: {vessel.fuel_consumption_tons_per_day or 30} tons/day
- Fuel type: {vessel.fuel_type or 'VLSFO'}
- Max wave height: {vessel.max_wave_height_meters or 8.0} m

Route:
- Origin: {origin}
- Destination: {destination}
- Priority: {priority}
- Weather at origin: temp {origin_weather.get('main',{}).get('temp',25)}°C, wind {origin_weather.get('wind',{}).get('speed',5)} m/s
- Weather at destination: temp {dest_weather.get('main',{}).get('temp',25)}°C, wind {dest_weather.get('wind',{}).get('speed',5)} m/s

For each option, provide:
- Route type (fastest, cheapest, safest, balanced)
- Total distance in nautical miles
- Estimated duration in hours
- Total fuel in tons
- Fuel cost in USD (assume $600/ton)
- A short explanation of why this route is best for that priority.

Also provide one overall explanation of how you calculated these routes.

Output as a JSON object with:
{{
  "explanation": "overall explanation",
  "options": [
    {{"route_type": "fastest", "distance_nm": 1200, "duration_hours": 72, "fuel_tons": 45, "cost_usd": 27000, "explanation": "..."}},
    ...
  ]
}}

Make the numbers realistic for a voyage of ~1200-2000 nm.
"""
        response = model.generate_content(prompt)
        raw = response.text

        # Clean markdown fences
        cleaned = raw.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        # Parse JSON
        data = json.loads(cleaned)

        explanation = data.get("explanation", "AI-generated route options.")
        options_data = data.get("options", [])

        # Convert to internal format
        result_options = []
        for opt in options_data:
            result_options.append({
                "route_type": opt.get("route_type", "balanced"),
                "distance": float(opt.get("distance_nm", 1500)),
                "time": f"{float(opt.get('duration_hours', 72)):.1f} hours",
                "fuel": float(opt.get("fuel_tons", 40)),
                "cost": float(opt.get("cost_usd", 24000)),
                "risk": 15,  # Placeholder
                "explanation": opt.get("explanation", ""),
                "waypoints": [
                    {"sequence": 1, "lat": origin_lat, "lon": origin_lon, "reason": "Origin"},
                    {"sequence": 2, "lat": (origin_lat + dest_lat)/2, "lon": (origin_lon + dest_lon)/2, "reason": "Midpoint"},
                    {"sequence": 3, "lat": dest_lat, "lon": dest_lon, "reason": "Destination"}
                ]
            })

        return {
            "options": result_options,
            "explanation": explanation
        }

    except Exception as e:
        print(f"⚠️ AI route generation failed: {e}")
        # Fallback to mock
        return generate_mock_options(vessel, priority)