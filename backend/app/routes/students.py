from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Student, Mentor, LeaveApplication
from app.schemas import StudentResponse
from app.auth import get_current_student

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("/me", response_model=StudentResponse)
def get_current_student_info(current_student=Depends(get_current_student), db: Session = Depends(get_db)):
    student_dict = {
        "id": current_student.id,
        "name": current_student.name,
        "roll_number": current_student.roll_number,
        "username": current_student.username,
        "department": current_student.department,
        "class_name": current_student.class_name,
        "year": current_student.year,
        "mentor_id": current_student.mentor_id,
        "phone_leave_used": current_student.phone_leave_used,
        "created_at": current_student.created_at,
    }
    if current_student.mentor_id:
        mentor = db.query(Mentor).filter(Mentor.id == current_student.mentor_id).first()
        student_dict["mentor_name"] = mentor.name if mentor else None
    else:
        student_dict["mentor_name"] = None
    return student_dict


@router.get("/applications", response_model=List[dict])
def get_student_applications(db: Session = Depends(get_db), current_student=Depends(get_current_student)):
    applications = db.query(LeaveApplication).filter(LeaveApplication.student_id == current_student.id).all()
    return [
        {
            "id": app.id,
            "leave_type": app.leave_type,
            "leave_date": app.leave_date,
            "from_date": app.from_date,
            "to_date": app.to_date,
            "status": app.status,
            "mentor_name": app.mentor_name,
            "created_at": app.created_at.isoformat() if app.created_at else None
        }
        for app in applications
    ]
