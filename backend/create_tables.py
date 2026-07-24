"""
One-time script to create all database tables from SQLAlchemy models.
Run this once during initial setup.
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, Base
from app.models import (
    User, Vessel, Port, RouteAnalysis,
    RouteOption, Waypoint, WeatherCache, CostReference
)


def create_all_tables():
    """
    Creates all tables defined in our models.
    Safe to run multiple times - uses create_all which
    only creates tables that don't exist.
    """
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ All tables created successfully!")

    # List created tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\nTables in database ({len(tables)}):")
    for table in sorted(tables):
        print(f"  • {table}")


if __name__ == "__main__":
    create_all_tables()