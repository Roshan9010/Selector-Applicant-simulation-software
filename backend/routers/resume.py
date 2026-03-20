from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List
import pickle
import pandas as pd
import re
import os
import io
from concurrent.futures import ThreadPoolExecutor
import asyncio

try:
    import PyPDF2
except ImportError:
    pass
    
try:
    import docx
except ImportError:
    pass

import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resume", tags=["resume"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

try:
    with open(os.path.join(DATA_DIR, "tfidf.pkl"), "rb") as f:
        tfidf = pickle.load(f)
    with open(os.path.join(DATA_DIR, "nn_model.pkl"), "rb") as f:
        nn_model = pickle.load(f)
    resumes_df = pd.read_pickle(os.path.join(DATA_DIR, "resumes_df.pkl"))
    MODELS_LOADED = True
except Exception as e:
    MODELS_LOADED = False
    print("Warning: Could not load ML resume models:", e)

def clean_text(text):
    text = re.sub('http\S+\s*', ' ', text)
    text = re.sub('RT|cc', ' ', text)
    text = re.sub('#\S+', '', text)
    text = re.sub('@\S+', '  ', text)
    text = re.sub('[%s]' % re.escape("""!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""), ' ', text)
    text = re.sub(r'[^\x00-\x7f]',r' ', text) 
    text = re.sub(r'\s+', ' ', text)
    return text.lower()

async def process_single_resume(file: UploadFile, required_skills: List[str], experience: float):
    filename_lower = file.filename.lower()
    if filename_lower.endswith(".zip") or filename_lower.endswith(".rar"):
        return None # Skip archives
        
    text = ""
    try:
        content = await file.read()
        
        if filename_lower.endswith(".pdf"):
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in reader.pages:
                text += page.extract_text() or ""
                
        elif filename_lower.endswith(".docx"):
            try:
                doc = docx.Document(io.BytesIO(content))
                text = "\n".join([para.text for para in doc.paragraphs])
            except Exception:
                text = content.decode("utf-8", errors="ignore")
                
        elif filename_lower.endswith(".csv"):
            try:
                df_csv = pd.read_csv(io.BytesIO(content))
                text = df_csv.to_string()
            except Exception:
                text = content.decode("utf-8", errors="ignore")
                
        else:
            # Fallback for ANY arbitrary type (doc, txt, rtf, code blocks, etc.)
            text = content.decode("utf-8", errors="ignore")
            if not text.strip():
                # Ultimate binary bypass, strip everything to standard latin 1
                text = content.decode("latin-1", errors="ignore")
                
    except Exception as e:
        return None
        
    if not text.strip():
        return None

    cleaned = clean_text(text)
    vector = tfidf.transform([cleaned])
    
    distances, indices = nn_model.kneighbors(vector)
    match_distance = distances[0][0]
    best_match_idx = indices[0][0]
    matched_category = resumes_df.iloc[best_match_idx]['Category']

    # Mathematical heuristic mapping Cosine Distance (typically 0.4 - 0.9) to an ATS percentage 40 - 95
    ats_score = max(0.0, min(100.0, (1.0 - (match_distance * 0.45)) * 100))
    
    # Custom logic for scoring based on matching details
    bonus = 0.0
    details_feedback = []
    
    if required_skills:
        matched_skills = [s for s in required_skills if s in text.lower()]
        if len(matched_skills) < len(required_skills):
            return None # Skip if not all skills found
        bonus += 15.0 
        details_feedback.append(f"Matched All Skills: {', '.join(matched_skills)}")
            
    # Regex heuristics for Experience extraction
    extracted_exp_match = re.search(r'(?i)([0-9]+(?:\.[0-9]+)?)\+?\s*(?:years|yrs)\s*(?:of\s*)?experience', text)
    
    if experience > 0.0:
        if extracted_exp_match:
            extracted_exp = float(extracted_exp_match.group(1))
            if extracted_exp < experience:
                return None # Skip if experience too low
            bonus += 10.0
            details_feedback.append(f"Meets Experience ({extracted_exp} yrs)")
        else:
            # Experience requested but none found in standard format
            return None # Skip if experience mandatory but not found
            
    # Email Extraction
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    extracted_email = email_match.group(0) if email_match else "Not found"
            
    final_score = min(100.0, ats_score + bonus)
    
    feedback_str = (
        f"Analyzed {len(text.split())} words. "
        f"Matches '{matched_category}' sector. "
        f"Criteria Check: {'; '.join(details_feedback) if details_feedback else 'None'}"
    )

    return {
        "filename": file.filename,
        "email": extracted_email,
        "score": round(final_score, 1),
        "feedback": feedback_str,
        "inferred_category": matched_category
    }

@router.post("/analyze")
async def analyze_resumes(
    skills: str = Form(""),
    experience: float = Form(0.0),
    files: List[UploadFile] = File(...)
):
    logger.info(f"Analyzing {len(files)} resumes with skills: {skills}, min_exp: {experience}")
    
    if not MODELS_LOADED:
        logger.error("ML Models not loaded!")
        raise HTTPException(status_code=500, detail="Machine Learning models are not loaded on server.")
        
    # Process skills criteria
    required_skills = [s.strip().lower() for s in skills.split(",")] if skills.strip() else []
    
    # Run resume processing in parallel
    tasks = [process_single_resume(file, required_skills, experience) for file in files]
    results = await asyncio.gather(*tasks)
    
    # Filter out None results and sort
    final_results = [r for r in results if r is not None]
    
    logger.info(f"Processed {len(files)} files. {len(final_results)} matches found.")
    
    if not final_results:
        raise HTTPException(status_code=400, detail="No valid resumes were found or processed.")
        
    # Sort results descending by score
    final_results.sort(key=lambda x: x["score"], reverse=True)
    return final_results
