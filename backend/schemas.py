from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "candidate"

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    role: str

class ReportResponse(BaseModel):
    id: int
    user_id: int
    domain: str
    overall_score: float
    facial_feedback: str
    vocal_feedback: str
    
    class Config:
        from_attributes = True
