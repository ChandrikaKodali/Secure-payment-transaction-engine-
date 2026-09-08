from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
from app.config import get_settings

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def verify_api_key(x_api_key: str | None = Security(api_key_header)) -> str:
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    if x_api_key != get_settings().api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key
