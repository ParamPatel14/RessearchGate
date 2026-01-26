from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    ADMIN_EMAIL: str

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str

    class Config:
        env_file = ".env"

settings = Settings()
