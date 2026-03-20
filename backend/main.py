from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, questions, analysis, resume

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Applicant Simulation API")

# Configure CORS - Allow all for production flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(analysis.router)
app.include_router(resume.router)

@app.get("/")
def read_root():
    return {"message": "Applicant Simulation Backend is running!"}
