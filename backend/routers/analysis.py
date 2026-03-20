from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
import models
import os
import shutil

router = APIRouter(prefix="/analyze", tags=["analysis"])

@router.post("/")
async def analyze_interview(
    user_id: int = Form(...),
    domain: str = Form(...),
    video_file: UploadFile = File(...),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    os.makedirs("temp_uploads", exist_ok=True)
    video_path = f"temp_uploads/{video_file.filename}"
    audio_path = f"temp_uploads/{audio_file.filename}"
    
    with open(video_path, "wb") as buffer:
        shutil.copyfileobj(video_file.file, buffer)
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)

    from ml_services import analyze_video_file, analyze_audio_file
    
    facial_feedback, face_score = analyze_video_file(video_path)
    audio_msg, audio_score = analyze_audio_file(audio_path)
    
    vocal_feedback = audio_msg
    overall_score = round((face_score + audio_score) / 2, 1)

    # Cleanup temp files
    try:
        os.remove(video_path)
        os.remove(audio_path)
    except:
        pass

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

    return {"message": "Analysis completed successfully", "report": new_report}
