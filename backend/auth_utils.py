import hashlib
from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET_KEY = "supersecretkey_for_applicant_sim"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def verify_password(plain_password, hashed_password):
    return get_password_hash(plain_password) == hashed_password

def get_password_hash(password):
    # Using hashlib instead of passlib/bcrypt to bypass Windows C++ build tooling errors 
    # and cryptography incompatibilities during the prototype phase.
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
