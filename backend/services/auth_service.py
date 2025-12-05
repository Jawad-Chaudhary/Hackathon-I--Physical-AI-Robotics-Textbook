"""
Authentication service
Supports Better-Auth token validation via auth server
"""

import hashlib
import secrets
import httpx
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.user import User, ExperienceLevel
from config import JWT_SECRET_KEY

# JWT configuration (legacy support)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Better-Auth server URL
AUTH_SERVER_URL = "http://localhost:3001"

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pwd_hash = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, pwd_hash = hashed_password.split('$')
        return hashlib.sha256((salt + plain_password).encode()).hexdigest() == pwd_hash
    except:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)

def validate_better_auth_token(token: str) -> dict:
    """Validate a Better-Auth session token via auth server"""
    try:
        with httpx.Client() as client:
            response = client.get(
                f"{AUTH_SERVER_URL}/api/validate-token/{token}",
                timeout=5.0
            )
            print(f"[AUTH] Token validation response: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                if data.get("valid"):
                    user = data.get("user", {})
                    return {
                        "sub": user.get("id"),
                        "email": user.get("email"),
                        "python_knowledge": user.get("pythonKnowledge", False),
                        "has_nvidia_gpu": user.get("hasNvidiaGpu", False),
                        "experience_level": user.get("experienceLevel", "beginner"),
                    }
    except Exception as e:
        print(f"[AUTH] Better-Auth validation error: {e}")
    return None

def validate_token(token: str) -> dict:
    """Validate a token - tries Better-Auth first, then legacy JWT"""
    print(f"[AUTH] Validating token: {token[:20]}...")
    
    # Try Better-Auth validation first
    payload = validate_better_auth_token(token)
    if payload:
        print(f"[AUTH] Better-Auth validation successful for: {payload.get('email')}")
        return payload
    
    # Fall back to legacy JWT
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        print(f"[AUTH] Legacy JWT validation successful")
        return payload
    except JWTError as e:
        print(f"[AUTH] JWT validation failed: {e}")
        return None

def validate_session_cookies(cookies: dict) -> dict:
    session_token = cookies.get("better-auth.session_token")
    if session_token:
        return validate_better_auth_token(session_token)
    return None

def create_user(db: Session, email: str, password: str, python_knowledge: bool,
                has_nvidia_gpu: bool, experience_level: str = "beginner") -> User:
    hashed = hash_password(password)
    exp_level = ExperienceLevel[experience_level] if isinstance(experience_level, str) else experience_level
    user = User(
        email=email,
        password_hash=hashed,
        python_knowledge=python_knowledge,
        has_nvidia_gpu=has_nvidia_gpu,
        experience_level=exp_level
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
