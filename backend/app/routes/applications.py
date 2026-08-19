from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import Student, Mentor, LeaveApplication
from app.schemas import LeaveApplicationCreate, LeaveApplicationResponse
from app.auth import get_current_student, get_current_mentor
from app.services.document_service import generate_leave_document
from app.services.validation_service import validate_form_data, validate_generated_image

router = APIRouter(prefix="/api/applications", tags=["applications"])


@router.post("/", response_model=LeaveApplicationResponse)
def create_application(
    leave_type: str = Form(...),
    reason: str = Form(...),
    leave_date: Optional[str] = Form(None),
    from_date: Optional[str] = Form(None),
    to_date: Optional[str] = Form(None),
    student_signature: Optional[str] = Form(None),
    parent_signature: Optional[str] = Form(None),
    days_leave_availed: Optional[str] = Form(None),
    days_absent: Optional[str] = Form(None),
    days_absent_test: Optional[str] = Form(None),
    phone_leave: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_student=Depends(get_current_student)
):
    if not current_student.mentor_id:
        raise HTTPException(
            status_code=400, detail="Please select a mentor first")

    if leave_type == "Phone Leave" and current_student.phone_leave_used:
        raise HTTPException(
            status_code=400, detail="Phone Leave has already been used")

    if not leave_date and not from_date:
        raise HTTPException(
            status_code=400, detail="Please provide leave date information")

    if not student_signature:
        raise HTTPException(
            status_code=400, detail="Please provide student signature")

    if not parent_signature:
        raise HTTPException(
            status_code=400, detail="Please provide parent signature")

    mentor = db.query(Mentor).filter(
        Mentor.id == current_student.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")

    generated_doc = generate_leave_document(
        student_name=current_student.name,
        roll_number=current_student.roll_number,
        department=current_student.department,
        class_name=current_student.class_name,
        year=current_student.year,
        mentor_name=mentor.name,
        leave_type=leave_type,
        reason=reason,
        leave_date=leave_date,
        from_date=from_date,
        to_date=to_date,
        student_signature=student_signature,
        parent_signature=parent_signature,
        days_leave_availed=days_leave_availed,
        days_absent=days_absent,
        days_absent_test=days_absent_test,
        phone_leave=phone_leave
    )

    application = LeaveApplication(
        student_id=current_student.id,
        student_name=current_student.name,
        roll_number=current_student.roll_number,
        mentor_id=mentor.id,
        mentor_name=mentor.name,
        leave_type=leave_type,
        reason=reason,
        leave_date=leave_date,
        from_date=from_date,
        to_date=to_date,
        student_signature=student_signature,
        parent_signature=parent_signature,
        days_leave_availed=days_leave_availed,
        days_absent=days_absent,
        days_absent_test=days_absent_test,
        phone_leave=phone_leave,
        generated_document=generated_doc,
        status="Pending"
    )

    if leave_type == "Phone Leave":
        current_student.phone_leave_used = True

    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/my-applications", response_model=List[LeaveApplicationResponse])
def get_my_applications(db: Session = Depends(get_db), current_student=Depends(get_current_student)):
    applications = db.query(LeaveApplication).filter(
        LeaveApplication.student_id == current_student.id).all()
    return applications


@router.get("/mentor/applications", response_model=List[LeaveApplicationResponse])
def get_mentor_applications(db: Session = Depends(get_db), current_mentor=Depends(get_current_mentor)):
    applications = db.query(LeaveApplication).filter(
        LeaveApplication.mentor_id == current_mentor.id).all()
    return applications


@router.get("/mentor/applications/{application_id}", response_model=LeaveApplicationResponse)
def get_mentor_application(application_id: int, db: Session = Depends(get_db), current_mentor=Depends(get_current_mentor)):
    application = db.query(LeaveApplication).filter(
        LeaveApplication.id == application_id,
        LeaveApplication.mentor_id == current_mentor.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.put("/mentor/applications/{application_id}/approve")
def approve_application(application_id: int, db: Session = Depends(get_db), current_mentor=Depends(get_current_mentor)):
    application = db.query(LeaveApplication).filter(
        LeaveApplication.id == application_id,
        LeaveApplication.mentor_id == current_mentor.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = "Approved"
    application.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Application approved successfully"}


@router.put("/mentor/applications/{application_id}/reject")
def reject_application(application_id: int, db: Session = Depends(get_db), current_mentor=Depends(get_current_mentor)):
    application = db.query(LeaveApplication).filter(
        LeaveApplication.id == application_id,
        LeaveApplication.mentor_id == current_mentor.id
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = "Rejected"
    application.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Application rejected successfully"}


@router.get("/mentor/print-all", response_model=List[dict])
def get_print_all_applications(db: Session = Depends(get_db), current_mentor=Depends(get_current_mentor)):
    applications = db.query(LeaveApplication).filter(
        LeaveApplication.mentor_id == current_mentor.id).all()
    return [
        {
            "id": app.id,
            "student_name": app.student_name,
            "roll_number": app.roll_number,
            "leave_type": app.leave_type,
            "leave_date": app.leave_date,
            "status": app.status,
            "generated_document": app.generated_document
        }
        for app in applications
    ]

