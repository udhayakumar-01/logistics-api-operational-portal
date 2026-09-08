import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Logistics API Operational Portal"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./logistics.db"
    STANDARD_RATE_LIMIT: int = 100
    PREMIUM_RATE_LIMIT: int = 500
    BURST_RATE_LIMIT: int = 20
    MAX_PAYLOAD_BYTES: int = 1048576 # 1MB
    
    class Config:
        case_sensitive = True

settings = Settings()
