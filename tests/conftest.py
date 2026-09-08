import pytest
import os
import sys
from fastapi.testclient import TestClient

# Add backend directory to sys.path
backend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app
from app.database import engine, Base, SessionLocal
from app.seed import seed_database_from_csv

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database_from_csv(db)
    db.close()
    yield

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers():
    return {"X-API-Key": "demo-api-key-partner-admin"}
