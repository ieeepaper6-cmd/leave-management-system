from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import Student, Mentor
from app.schemas import StudentCreate, StudentResponse, MentorCreate, MentorResponse, StudentLogin, MentorLogin, Token
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register-student", response_model=StudentResponse)
def register_student(student: StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.username == student.username).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_student = db.query(Student).filter(Student.roll_number == student.roll_number).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Roll number already registered")
    
    hashed_password = get_password_hash(student.password)
    db_student = Student(
        name=student.name,
        roll_number=student.roll_number,
        username=student.username,
        password_hash=hashed_password,
        department=student.department,
        class_name=student.class_name,
        year=student.year,
        mentor_id=student.mentor_id,
        phone_leave_used=student.phone_leave_used
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@router.post("/register-mentor", response_model=MentorResponse)
def register_mentor(mentor: MentorCreate, db: Session = Depends(get_db)):
    db_mentor = db.query(Mentor).filter(Mentor.username == mentor.username).first()
    if db_mentor:
        raise HTTPException(status_code=400, detail="Username already registered")
    
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


@router.post("/login", response_model=Token)
def login(login_data: StudentLogin, db: Session = Depends(get_db)):
    user = db.query(Student).filter(Student.username == login_data.username).first()
    user_type = "student"
    
    if not user:
        user = db.query(Mentor).filter(Mentor.username == login_data.username).first()
        user_type = "mentor"
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=480)
    access_token = create_access_token(
        data={"sub": str(user.id), "user_type": user_type},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user_type,
        "user_id": user.id,
        "name": user.name
    }


@router.get("/me", response_model=dict)
def get_current_user_info(current_user=Depends(get_current_user)):
    user, user_type = current_user
    return {
        "id": user.id,
        "name": user.name,
        "user_type": user_type,
        "department": user.department,
        "class_name": user.class_name if hasattr(user, 'class_name') else user.class_name,
        "year": getattr(user, 'year', None)
    }
