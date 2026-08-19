from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import Student, Mentor
from app.schemas import StudentCreate, StudentResponse, MentorCreate, MentorResponse, StudentLogin, MentorLogin, Token, RefreshToken
from app.auth import verify_password, get_password_hash, create_access_token, create_refresh_token, validate_password_strength, is_account_locked, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register-student", response_model=StudentResponse)
def register_student(student: StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(Student).filter(Student.username == student.username).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_student = db.query(Student).filter(Student.roll_number == student.roll_number).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Roll number already registered")
    
    is_valid, message = validate_password_strength(student.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
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
    
    is_valid, message = validate_password_strength(mentor.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
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
    from datetime import datetime
    
    user = db.query(Student).filter(Student.username == login_data.username).first()
    user_type = "student"
    
    if not user:
        user = db.query(Mentor).filter(Mentor.username == login_data.username).first()
        user_type = "mentor"
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if account is locked
    if is_account_locked(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is locked due to multiple failed login attempts. Please try again later."
        )
    
    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        # Increment failed login attempts
        user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
        
        # Lock account after 5 failed attempts
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account locked due to multiple failed login attempts. Please try again after 15 minutes."
            )
        
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Incorrect username or password. {5 - user.failed_login_attempts} attempts remaining.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Reset failed attempts on successful login
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()
    
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": str(user.id), "user_type": user_type},
        expires_delta=access_token_expires
    )
    
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "user_type": user_type}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_type": user_type,
        "user_id": user.id,
        "name": user.name
    }


@router.post("/refresh", response_model=Token)
def refresh_token(refresh_data: RefreshToken, db: Session = Depends(get_db)):
    from jose import JWTError
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(refresh_data.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        user_type: str = payload.get("user_type")
        token_type: str = payload.get("type")
        
        if user_id is None or user_type is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    if user_type == "student":
        user = db.query(Student).filter(Student.id == int(user_id)).first()
    elif user_type == "mentor":
        user = db.query(Mentor).filter(Mentor.id == int(user_id)).first()
    else:
        raise credentials_exception
    
    if user is None:
        raise credentials_exception
    
    access_token_expires = timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": str(user.id), "user_type": user_type},
        expires_delta=access_token_expires
    )
    
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id), "user_type": user_type}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
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
