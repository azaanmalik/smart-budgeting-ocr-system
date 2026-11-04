from datetime import datetime, timedelta, timezone
from pathlib import Path
import os
from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY or SECRET_KEY.startswith("REPLACE_") or len(SECRET_KEY) < 32:
    raise RuntimeError("Set SECRET_KEY to a random value of 32+ characters in backend/.env")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
