import logging
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend import models
import uuid
import os
from backend.email_utils import send_email, compose_invitation_email

logger = logging.getLogger("backend.routers.questions")
logger.debug("backend.routers.questions: import start")

router = APIRouter(prefix="/questions", tags=["questions"])

DOMAINS = ["Machine Learning", "Deep Learning", "Java", "Python", "JavaScript", "ReactJs", "C", "SQL", "Frontend"]

QUESTIONS_MAP = {
    "Machine Learning": [
        "1. Explain the Bias-Variance tradeoff.",
        "2. What is the difference between supervised and unsupervised learning?",
        "3. How does cross-validation handle overfitting?",
        "4. Explain how Random Forests make predictions.",
        "5. What are the advantages of Neural Networks over traditional algorithms?",
        "6. Describe the concept of Gradient Descent in deep learning.",
        "7. How do you handle highly imbalanced datasets?",
        "8. Explain what L1 and L2 regularization do.",
        "9. What are Recurrent Neural Networks typically used for?",
        "10. Describe how a Support Vector Machine finds the optimal hyperplane."
    ],
    "Java": [
        "1. Explain the concept of OOP in Java and its core principles.",
        "2. How does Garbage Collection work in the JVM?",
        "3. What is the difference between an Interface and an Abstract Class?",
        "4. Explain multithreading and the synchronized keyword in Java.",
        "5. Describe the Java Collections Framework. List vs Map vs Set.",
        "6. How are exceptions handled in Java?",
        "7. What are the differences between equals() and ==?",
        "8. Explain the Singleton design pattern.",
        "9. How does the Java 8 Streams API change data processing?",
        "10. What is a Memory Leak in Java and how do you prevent it?"
    ],
    "Python": [
        "1. What are decorators in Python and how do you use them?",
        "2. Explain the difference between lists and tuples.",
        "3. How does Python manage memory natively? Explain the Global Interpreter Lock (GIL).",
        "4. What are list comprehensions?",
        "5. Describe the use of *args and **kwargs in functions.",
        "6. What is the difference between deep copy and shallow copy?",
        "7. Explain how the yield keyword creates a generator.",
        "8. How do you handle exceptions efficiently in Python?",
        "9. Describe the key differences between Python 2 and Python 3.",
        "10. What are lambda functions used for?"
    ],
    "SQL": [
        "1. What is the difference between INNER JOIN and LEFT JOIN?",
        "2. Explain the concept of database normalization (1NF, 2NF, 3NF).",
        "3. What are SQL injections and how can you prevent them?",
        "4. Describe the difference between a clustered and non-clustered index.",
        "5. What is a subquery and when should it be used?",
        "6. Explain the ACID properties of a database transaction.",
        "7. How does the GROUP BY clause work in conjunction with aggregate functions?",
        "8. What is the difference between the WHERE and HAVING clauses?",
        "9. Explain how triggers work in relational databases.",
        "10. What are the differences between DDL, DML, and DCL commands?"
    ],
    "Frontend": [
        "1. Explain the CSS Box Model.",
        "2. What are the functional differences between var, let, and const in JavaScript?",
        "3. Describe how the Virtual DOM works and why it's efficient in React.",
        "4. What is the event loop in JavaScript?",
        "5. Explain CSS Specificity rules.",
        "6. How do closures work in JavaScript?",
        "7. What are React Hooks? Explain the use cases for useEffect.",
        "8. Describe Semantic HTML and its importance for accessibility.",
        "9. What is CORS and how do you handle it on the frontend?",
        "10. How would you optimize the loading performance of a modern web application?"
    ],
    "JavaScript": [
        "1. What is the difference between == and ===?",
        "2. Explain the concept of 'hoisting' in JavaScript.",
        "3. What are 'closures' and how are they useful?",
        "4. Describe the difference between null and undefined.",
        "5. What is the 'this' keyword in JavaScript and how does its value change?",
        "6. Explain the difference between var, let, and const.",
        "7. What are arrow functions and how do they differ from regular functions?",
        "8. Explain the concept of Prototypes and Prototypal Inheritance.",
        "9. What is a 'Promise' and how do you handle asynchronous code?",
        "10. Describe the JavaScript Event Loop and Callback Queue."
    ],
    "C": [
        "1. What are the main features of the C programming language?",
        "2. Explain the difference between malloc() and calloc().",
        "3. What is a 'pointer' and how do you declare one?",
        "4. Describe the difference between a struct and a union.",
        "5. What is the purpose of the static keyword in C?",
        "6. Explain how memory is managed in C (Stack vs Heap).",
        "7. What are 'preprocessor directives'?",
        "8. How do you pass arguments to a function by value vs by reference (using pointers)?",
        "9. What is 'segmentation fault' and what causes it?",
        "10. Explain the difference between #include <file> and #include \"file\"."
    ],
    "Deep Learning": [
        "1. What is an Activation Function? Give examples like ReLU and Sigmoid.",
        "2. Explain the concept of Backpropagation.",
        "3. What is a Convolutional Neural Network (CNN) primarily used for?",
        "4. Describe the difference between Batch Gradient Descent and Stochastic Gradient Descent.",
        "5. What is 'Dropout' and how does it prevent overfitting?",
        "6. Explain the vanishing gradient problem.",
        "7. What are Generative Adversarial Networks (GANs)?",
        "8. Describe the architecture of a Transformer model.",
        "9. What is Transfer Learning and when is it useful?",
        "10. Explain the difference between an Encoder and a Decoder in sequence models."
    ],
    "ReactJs": [
        "1. What is the 'Virtual DOM' and how does React use it?",
        "2. Explain the difference between Functional and Class components.",
        "3. What are React Hooks? List common ones like useState and useEffect.",
        "4. How do you handle 'props' and 'state' in React?",
        "5. What is 'Prop Drilling' and how can you avoid it?",
        "6. Explain the importance of the key prop when rendering lists.",
        "7. What is 'Conditional Rendering' in React?",
        "8. Describe the React Component Lifecycle.",
        "9. What is a 'Higher-Order Component' (HOC)?",
        "10. How does the useContext hook help with state management?"
    ]
}

@router.get("/domains")
def get_domains():
    return {"domains": DOMAINS}

@router.get("/{domain}")
def get_questions_by_domain(domain: str, db: Session = Depends(get_db)):
    # Delete existing questions for the domain to ensure we load the fresh 10 questions cleanly
    db.query(models.Question).filter(models.Question.domain == domain).delete()
    db.commit()

    # Load from the hardcoded map
    q_list = QUESTIONS_MAP.get(domain, [])
    for q_text in q_list:
        db.add(models.Question(domain=domain, text=q_text))
    
    db.commit()
    return db.query(models.Question).filter(models.Question.domain == domain).limit(10).all()

@router.post("/create-invitation")
def create_interview_invitation(
    candidate_email: str = Form(...),
    candidate_name: str = Form(...),
    domain: str = Form(...),
    db: Session = Depends(get_db)
):
    """Create an interview invitation link for a candidate"""
    try:
        # Generate unique token
        token = str(uuid.uuid4())
        
        # Create invitation record
        invitation = models.InterviewInvitation(
            candidate_email=candidate_email,
            candidate_name=candidate_name,
            domain=domain,
            invitation_token=token
        )
        
        db.add(invitation)
        db.commit()
        db.refresh(invitation)
        
        # Generate invitation link (frontend URL)
        invitation_link = f"http://localhost:5173/interview/{domain}?token={token}"
        # Attempt to send email to candidate
        email_sent = False
        email_error = None
        # Compose email via model (if available) or fallback template
        try:
            subject, body, html = compose_invitation_email(candidate_name, domain, invitation_link)
        except Exception:
            subject = f"Interview Invitation - {domain}"
            body = f"Hi {candidate_name},\n\nYou have been invited to a {domain} interview. Click the link to start: {invitation_link}\n\nBest regards"
            html = f"<p>Hi {candidate_name},</p><p>You have been invited to a <strong>{domain}</strong> interview.</p><p><a href=\"{invitation_link}\">Start your interview</a></p><p>Best regards</p>"

        try:
            send_email(candidate_email, subject, body, html)
            email_sent = True
        except Exception as e:
            # don't fail the whole request for email issues; return info for UI
            email_error = str(e)

        return {
            "message": "Invitation created successfully",
            "invitation_link": invitation_link,
            "candidate_email": candidate_email,
            "domain": domain,
            "token": token,
            "email_sent": email_sent,
            "email_error": email_error,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create invitation: {str(e)}")

@router.get("/validate-invitation/{token}")
def validate_invitation(token: str, db: Session = Depends(get_db)):
    """Validate an invitation token before allowing the interview"""
    invitation = db.query(models.InterviewInvitation).filter(
        models.InterviewInvitation.invitation_token == token
    ).first()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid invitation token")
    
    if invitation.is_completed:
        raise HTTPException(status_code=400, detail="This interview has already been completed")
    
    # Mark as opened and record timestamp
    if not invitation.is_opened:
        invitation.is_opened = True
        invitation.opened_at = func.now()
        db.commit()
    
    return {
        "valid": True,
        "candidate_name": invitation.candidate_name,
        "domain": invitation.domain,
        "opened_at": str(invitation.opened_at) if invitation.opened_at else None
    }

@router.get("/invitations/status/{token}")
def get_invitation_status(token: str, db: Session = Depends(get_db)):
    """Get the status of an invitation (for recruiters to track)"""
    invitation = db.query(models.InterviewInvitation).filter(
        models.InterviewInvitation.invitation_token == token
    ).first()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    return {
        "candidate_email": invitation.candidate_email,
        "candidate_name": invitation.candidate_name,
        "domain": invitation.domain,
        "is_opened": invitation.is_opened,
        "opened_at": str(invitation.opened_at) if invitation.opened_at else None,
        "is_completed": invitation.is_completed,
        "created_at": str(invitation.created_at)
    }
