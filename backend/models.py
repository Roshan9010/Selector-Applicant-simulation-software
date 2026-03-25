from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="candidate") # "admin" or "candidate"

    reports = relationship("Report", back_populates="user")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, index=True) # "Machine Learning", "Java", "Android"
    text = Column(String)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    domain = Column(String)
    
    overall_score = Column(Float)
    facial_feedback = Column(String)
    vocal_feedback = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reports")

class InterviewInvitation(Base):
    __tablename__ = "interview_invitations"

    id = Column(Integer, primary_key=True, index=True)
    candidate_email = Column(String, index=True)
    candidate_name = Column(String)
    domain = Column(String)
    invitation_token = Column(String, unique=True, index=True)
    is_completed = Column(Boolean, default=False)
    is_opened = Column(Boolean, default=False)  # Track if link was opened
    opened_at = Column(DateTime(timezone=True), nullable=True)  # When opened
    created_at = Column(DateTime(timezone=True), server_default=func.now())
