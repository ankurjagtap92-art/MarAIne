from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import uuid4
from ..models import Port

def get_or_create_port(db: Session, name: str, unlocode: str) -> Port:
    """
    Get a port by its UN/LOCODE, or create it if it doesn't exist.
    Handles duplicate key errors gracefully.
    """
    # Try to find existing port
    port = db.query(Port).filter(Port.unlocode == unlocode).first()
    if port:
        return port

    # Try to create a new one
    try:
        port = Port(
            id=uuid4(),
            name=name.strip(),
            country="Unknown",
            unlocode=unlocode,
            latitude=0.0,
            longitude=0.0,
        )
        db.add(port)
        db.flush()  # raises IntegrityError if UN/LOCODE already exists
        return port
    except IntegrityError:
        # Rollback the failed insert and return the existing one
        db.rollback()
        port = db.query(Port).filter(Port.unlocode == unlocode).first()
        return port