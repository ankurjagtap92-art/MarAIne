"""
MarAIne - Application Configuration
Loads settings from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """
    Central configuration class.
    All values come from .env file or environment variables.
    Pydantic validates types automatically.
    """

    # Application
    APP_NAME: str = "MarAIne"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    SECRET_KEY: str

    # Database
    DATABASE_URL: str
    TEST_DATABASE_URL: str

    # JWT Authentication
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # API Keys
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENWEATHERMAP_API_KEY: str = ""

    # CORS
    # In config.py
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        """
        Tells Pydantic to load from .env file.
        Case-insensitive matching.
        """
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def cors_origins(self) -> List[str]:
        """
        Converts comma-separated string to list.
        "http://a.com,http://b.com" → ["http://a.com", "http://b.com"]
        """
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    @property
    def database_url_for_env(self) -> str:
        """
        Returns test DB URL if running tests, dev URL otherwise.
        We'll use this when we write tests.
        """
        import os

        if os.getenv("TESTING") == "true":
            return self.TEST_DATABASE_URL
        return self.DATABASE_URL


@lru_cache()
def get_settings() -> Settings:
    """
    Returns cached Settings instance.
    @lru_cache ensures .env is read only once, not on every import.
    This is a FastAPI best practice.
    """
    return Settings()


# Global instance for easy import
settings = get_settings()