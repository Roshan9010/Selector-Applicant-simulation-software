import logging
import sys
import traceback

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Basic startup logging to help diagnose import-time failures
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("backend.startup")

logger.debug("main.py: starting import sequence")

from .database import engine, Base

# Import routers inside try/except so we can log import errors clearly
try:
    logger.debug("main.py: importing routers package")
    from .routers import auth, questions, analysis, resume, admin
    logger.debug("main.py: routers imported successfully")
except Exception:
    logger.exception("main.py: failed importing routers")
    # Print traceback to stderr for external capture (uvicorn/CLI)
    traceback.print_exc(file=sys.stderr)
    raise
# Run non-destructive migrations (if present) before creating tables
try:
    logger.debug("main.py: attempting to run migrate_add_columns (if present)")
    from . import migrate_add_columns
    try:
        migrate_add_columns.main()
    except Exception:
        logger.exception("main.py: migrate_add_columns.main() failed, continuing")
        pass
except Exception:
    logger.debug("main.py: migrate_add_columns not present, skipping")
    pass

# Create database tables
Base.metadata.create_all(bind=engine)

logger.debug("main.py: creating FastAPI app")
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
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Applicant Simulation Backend is running!"}
