import logging
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
import os
import shutil
import asyncio
import logging
from fastapi.concurrency import run_in_threadpool
from backend import schemas

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger = logging.getLogger("backend.routers.analysis")
logger.debug("backend.routers.analysis: import start")

router = APIRouter(prefix="/analyze", tags=["analysis"])

@router.post("/")
async def analyze_interview(
    user_id: int = Form(...),
    domain: str = Form(...),
    video_file: UploadFile = File(...),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    logger.info(f"Starting analysis for user {user_id} in domain {domain}")
    
    os.makedirs("temp_uploads", exist_ok=True)
    video_path = f"temp_uploads/{video_file.filename}"
    audio_path = f"temp_uploads/{audio_file.filename}"
    
    try:
        # Write files asynchronously
        logger.info(f"Writing temp files: {video_path}, {audio_path}")
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)

        from backend.ml_services import analyze_video_file, analyze_audio_file
        
        # Run heavy ML analysis in a threadpool to avoid blocking the event loop
        logger.info("Running ML analysis tasks...")
        video_task = run_in_threadpool(analyze_video_file, video_path)
        audio_task = run_in_threadpool(analyze_audio_file, audio_path)
        
        (facial_feedback, face_score), (audio_msg, audio_score) = await asyncio.gather(video_task, audio_task)
        
        logger.info(f"Analysis complete. Scores - Face: {face_score}, Audio: {audio_score}")
        
        vocal_feedback = audio_msg
        overall_score = round((face_score + audio_score) / 2, 1)

        # Save report to database
        new_report = models.Report(
            user_id=user_id,
            domain=domain,
            overall_score=overall_score,
            facial_feedback=facial_feedback,
            vocal_feedback=vocal_feedback
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        
        logger.info(f"Report saved to database with ID: {new_report.id}")

        # Convert to dict to ensure clean serialization without SQLAlchemy lazy-load issues
        report_data = {
            "id": new_report.id,
            "user_id": new_report.user_id,
            "domain": new_report.domain,
            "overall_score": new_report.overall_score,
            "facial_feedback": new_report.facial_feedback,
            "vocal_feedback": new_report.vocal_feedback,
            "created_at": str(new_report.created_at)
        }

        return {"message": "Analysis completed successfully", "report": report_data}

    except Exception as e:
        logger.error(f"Error during interview analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
        
    finally:
        # Cleanup temp files asynchronously
        def cleanup():
            try:
                if os.path.exists(video_path): os.remove(video_path)
                if os.path.exists(audio_path): os.remove(audio_path)
                logger.info("Temporary files cleaned up.")
            except Exception as ce:
                logger.warning(f"Failed to cleanup temp files: {str(ce)}")
                
        await run_in_threadpool(cleanup)
