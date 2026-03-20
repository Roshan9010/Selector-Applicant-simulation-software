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
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    role: str
