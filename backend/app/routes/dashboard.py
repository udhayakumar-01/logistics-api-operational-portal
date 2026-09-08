from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.metrics_service import get_dashboard_telemetry

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    return get_dashboard_telemetry(db)
