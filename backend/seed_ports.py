"""
MarAIne - Port Seed Data
Populates the ports table with real major ports for demo purposes.

Run once: python seed_ports.py
Safe to run multiple times - skips existing ports.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models import Port


PORTS_DATA = [
    # Indian Major Ports
    {
        "name": "Mumbai Port",
        "country": "India",
        "unlocode": "INBOM",
        "latitude": 18.9500,
        "longitude": 72.8500,
        "timezone": "Asia/Kolkata",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 12.5,
        "congestion_index": 6.5,
    },
    {
        "name": "Jawaharlal Nehru Port (Nhava Sheva)",
        "country": "India",
        "unlocode": "INNSA",
        "latitude": 18.9500,
        "longitude": 72.9500,
        "timezone": "Asia/Kolkata",
        "has_container_terminal": True,
        "has_bulk_terminal": False,
        "max_vessel_draft": 14.0,
        "congestion_index": 7.0,
    },
    {
        "name": "Chennai Port",
        "country": "India",
        "unlocode": "INMAA",
        "latitude": 13.1000,
        "longitude": 80.3000,
        "timezone": "Asia/Kolkata",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 16.5,
        "congestion_index": 5.0,
    },
    {
        "name": "Kolkata Port",
        "country": "India",
        "unlocode": "INCCU",
        "latitude": 22.5500,
        "longitude": 88.3000,
        "timezone": "Asia/Kolkata",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 9.0,
        "congestion_index": 5.5,
    },
    {
        "name": "Visakhapatnam Port",
        "country": "India",
        "unlocode": "INVTZ",
        "latitude": 17.6900,
        "longitude": 83.2900,
        "timezone": "Asia/Kolkata",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 14.5,
        "congestion_index": 4.0,
    },
    {
        "name": "Kochi Port",
        "country": "India",
        "unlocode": "INCOK",
        "latitude": 9.9700,
        "longitude": 76.2500,
        "timezone": "Asia/Kolkata",
        "has_container_terminal": True,
        "has_bulk_terminal": False,
        "max_vessel_draft": 12.5,
        "congestion_index": 3.5,
    },
    {
        "name": "Mundra Port",
        "country": "India",
        "unlocode": "INMUN",
        "latitude": 22.7400,
        "longitude": 69.7000,
        "timezone": "Asia/Kolkata",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 17.5,
        "congestion_index": 5.5,
    },
    {
        "name": "Kandla Port",
        "country": "India",
        "unlocode": "INIXY",
        "latitude": 23.0100,
        "longitude": 70.2200,
        "timezone": "Asia/Kolkata",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 10.5,
        "congestion_index": 4.5,
    },
    # International Major Ports
    {
        "name": "Port of Singapore",
        "country": "Singapore",
        "unlocode": "SGSIN",
        "latitude": 1.2600,
        "longitude": 103.8400,
        "timezone": "Asia/Singapore",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "has_lng_terminal": True,
        "max_vessel_draft": 16.0,
        "congestion_index": 7.5,
    },
    {
        "name": "Port of Shanghai",
        "country": "China",
        "unlocode": "CNSHA",
        "latitude": 31.4000,
        "longitude": 121.6000,
        "timezone": "Asia/Shanghai",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 15.5,
        "congestion_index": 8.0,
    },
    {
        "name": "Port of Rotterdam",
        "country": "Netherlands",
        "unlocode": "NLRTM",
        "latitude": 51.9000,
        "longitude": 4.3000,
        "timezone": "Europe/Amsterdam",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "has_lng_terminal": True,
        "max_vessel_draft": 24.0,
        "congestion_index": 5.0,
    },
    {
        "name": "Jebel Ali Port",
        "country": "UAE",
        "unlocode": "AEJEA",
        "latitude": 24.9900,
        "longitude": 55.0700,
        "timezone": "Asia/Dubai",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 17.0,
        "congestion_index": 5.5,
    },
    {
        "name": "Port of Colombo",
        "country": "Sri Lanka",
        "unlocode": "LKCMB",
        "latitude": 6.9500,
        "longitude": 79.8500,
        "timezone": "Asia/Colombo",
        "has_container_terminal": True,
        "has_bulk_terminal": False,
        "max_vessel_draft": 15.0,
        "congestion_index": 4.0,
    },
    {
        "name": "Port of Antwerp",
        "country": "Belgium",
        "unlocode": "BEANR",
        "latitude": 51.2600,
        "longitude": 4.3700,
        "timezone": "Europe/Brussels",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "has_lng_terminal": True,
        "max_vessel_draft": 16.0,
        "congestion_index": 5.5,
    },
    {
        "name": "Port of Hamburg",
        "country": "Germany",
        "unlocode": "DEHAM",
        "latitude": 53.5300,
        "longitude": 9.9600,
        "timezone": "Europe/Berlin",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 14.5,
        "congestion_index": 5.0,
    },
    {
        "name": "Port of Los Angeles",
        "country": "USA",
        "unlocode": "USLAX",
        "latitude": 33.7300,
        "longitude": -118.2600,
        "timezone": "America/Los_Angeles",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 16.0,
        "congestion_index": 8.5,
    },
    {
        "name": "Port of Mombasa",
        "country": "Kenya",
        "unlocode": "KEMBA",
        "latitude": -4.0500,
        "longitude": 39.6600,
        "timezone": "Africa/Nairobi",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 13.0,
        "congestion_index": 6.0,
    },
    {
        "name": "Port of Durban",
        "country": "South Africa",
        "unlocode": "ZADUR",
        "latitude": -29.8800,
        "longitude": 31.0300,
        "timezone": "Africa/Johannesburg",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 12.8,
        "congestion_index": 7.0,
    },
    {
        "name": "Port of Chittagong",
        "country": "Bangladesh",
        "unlocode": "BDCGP",
        "latitude": 22.3100,
        "longitude": 91.8000,
        "timezone": "Asia/Dhaka",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 9.5,
        "congestion_index": 9.0,
    },
    {
        "name": "Port Klang",
        "country": "Malaysia",
        "unlocode": "MYPKG",
        "latitude": 3.0000,
        "longitude": 101.3900,
        "timezone": "Asia/Kuala_Lumpur",
        "has_container_terminal": True,
        "has_bulk_terminal": True,
        "max_vessel_draft": 15.0,
        "congestion_index": 4.5,
    },
]


def seed_ports():
    """Seed the ports table with real port data."""
    db = SessionLocal()
    count_added = 0
    count_skipped = 0

    for port_data in PORTS_DATA:
        # Check if port already exists by UN/LOCODE
        existing = db.query(Port).filter(
            Port.unlocode == port_data["unlocode"]
        ).first()

        if existing:
            count_skipped += 1
            continue

        port = Port(**port_data)
        db.add(port)
        count_added += 1

    db.commit()
    db.close()

    print(f"✅ Port seeding complete!")
    print(f"   Added: {count_added}")
    print(f"   Skipped (already exist): {count_skipped}")
    print(f"   Total ports in data: {len(PORTS_DATA)}")


if __name__ == "__main__":
    seed_ports()