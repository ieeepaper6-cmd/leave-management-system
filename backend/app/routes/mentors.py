from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Mentor, Student, LeaveApplication
from app.schemas import MentorResponse, MentorCreate
from app.auth import get_current_mentor, get_current_student

router = APIRouter(prefix="/api/mentors", tags=["mentors"])


@router.get("/", response_model=List[MentorResponse])
def get_mentors(db: Session = Depends(get_db)):
    mentors = db.query(Mentor).all()
    return mentors


@router.post("/", response_model=MentorResponse)
def create_mentor(mentor: MentorCreate, db: Session = Depends(get_db), current_mentor=Depends(get_current_mentor)):
    db_mentor = db.query(Mentor).filter(Mentor.username == mentor.username).first()
    if db_mentor:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    from app.auth import get_password_hash
    hashed_password = get_password_hash(mentor.password)
    db_mentor = Mentor(
        name=mentor.name,
        username=mentor.username,
        password_hash=hashed_password,
        department=mentor.department,
        class_name=mentor.class_name
    )
    db.add(db_mentor)
    db.commit()
    db.refresh(db_mentor)
    return db_mentor


@router.get("/{mentor_id}", response_model=MentorResponse)
def get_mentor(mentor_id: int, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    return mentor


@router.put("/select-mentor/{mentor_id}")
def select_mentor(mentor_id: int, db: Session = Depends(get_db), current_student=Depends(get_current_student)):
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    current_student.mentor_id = mentor_id
    db.commit()
    return {"message": "Mentor selected successfully", "mentor_id": mentor_id}


@router.get("/dashboard/stats", response_model=dict)
def get_mentor_dashboard_stats(db: Session = Depends(get_db), current_mentor=Depends(get_current_mentor)):
    total = db.query(LeaveApplication).filter(LeaveApplication.mentor_id == current_mentor.id).count()
    pending = db.query(LeaveApplication).filter(LeaveApplication.mentor_id == current_mentor.id, LeaveApplication.status == "Pending").count()
    approved = db.query(LeaveApplication).filter(LeaveApplication.mentor_id == current_mentor.id, LeaveApplication.status == "Approved").count()
    rejected = db.query(LeaveApplication).filter(LeaveApplication.mentor_id == current_mentor.id, LeaveApplication.status == "Rejected").count()
    
    return {
        "total": total,
        "pending": pending,
        "approved": approved,
        "rejected": rejected
    }
