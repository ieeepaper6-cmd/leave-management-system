from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from app.database import engine
from app.models import Base
from app.routes import auth, mentors, students, applications
import os
import time
import hashlib
from pathlib import Path
from dotenv import load_dotenv
from collections import defaultdict
from datetime import datetime, timedelta

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Digital Leave Management System", version="1.0.0")

# Trusted Host Middleware - prevents host header attacks
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# CORS - restrict to specific origins in production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    max_age=3600,
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response

# Rate limiting storage
from collections import defaultdict
from datetime import datetime, timedelta

login_attempts = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 10
RATE_LIMIT_WINDOW = timedelta(minutes=1)
LOCKOUT_DURATION = timedelta(minutes=15)

# Request size limit middleware
MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10MB

@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_SIZE:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request too large"}
        )
    return await call_next(request)


# Rate limiting middleware
rate_limit_store = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 100
RATE_LIMIT_WINDOW = timedelta(minutes=1)

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = get_client_ip(request)
    now = datetime.utcnow()
    
    # Clean old entries
    rate_limit_store[client_ip] = [
        req_time for req_time in rate_limit_store[client_ip]
        if now - req_time < RATE_LIMIT_WINDOW
    ]
    
    # Check rate limit
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."}
        )
    
    rate_limit_store[client_ip].append(now)
    return await call_next(request)

# Input sanitization middleware
@app.middleware("http")
async def sanitize_input(request: Request, call_next):
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            body = await request.body()
            if b"<script>" in body.lower() or b"javascript:" in body.lower():
                return JSONResponse(
                    status_code=400,
                    content={"detail": "Invalid input detected"}
                )
        except Exception:
            pass
    return await call_next(request)

app.include_router(auth.router)
app.include_router(mentors.router)
app.include_router(students.router)
app.include_router(applications.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Digital Leave Management System is running"}


@app.get("/api/seed")
def seed_data():
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    from app.models import Student, Mentor
    from app.auth import get_password_hash
    
    db = SessionLocal()
    
    mentor1 = db.query(Mentor).filter(Mentor.username == "saraswathi").first()
    if not mentor1:
        mentor1 = Mentor(
            name="Saraswathi",
            username="saraswathi",
            password_hash=get_password_hash("sar@123"),
            department="IT",
            class_name="A"
        )
        db.add(mentor1)
        db.commit()
        db.refresh(mentor1)
    
    mentor2 = db.query(Mentor).filter(Mentor.username == "periyanayaki").first()
    if not mentor2:
        mentor2 = Mentor(
            name="Periya Nayaki",
            username="periyanayaki",
            password_hash=get_password_hash("per@123"),
            department="IT",
            class_name="A"
        )
        db.add(mentor2)
        db.commit()
        db.refresh(mentor2)
    
    student1 = db.query(Student).filter(Student.username == "harivignesh").first()
    if not student1:
        student1 = Student(
            name="Harivignesh S",
            roll_number="23ITA37",
            username="harivignesh",
            password_hash=get_password_hash("23ITA37"),
            department="IT",
            class_name="A",
            year="4th / A",
            mentor_id=mentor1.id,
            phone_leave_used=False
        )
        db.add(student1)
    
    student2 = db.query(Student).filter(Student.username == "ashwin").first()
    if not student2:
        student2 = Student(
            name="Ashwin R",
            roll_number="24LITA02",
            username="ashwin",
            password_hash=get_password_hash("24LITA02"),
            department="IT",
            class_name="A",
            year="4th / A",
            mentor_id=mentor1.id,
            phone_leave_used=False
        )
        db.add(student2)
    
    student3 = db.query(Student).filter(Student.username == "manikandan").first()
    if not student3:
        student3 = Student(
            name="Manikandan M",
            roll_number="22LTA01",
            username="manikandan",
            password_hash=get_password_hash("22LTA01"),
            department="IT",
            class_name="A",
            year="4th / A",
            mentor_id=mentor2.id,
            phone_leave_used=False
        )
        db.add(student3)
    
    student4 = db.query(Student).filter(Student.username == "srisanth").first()
    if not student4:
        student4 = Student(
            name="Sri santh A",
            roll_number="23ITA55",
            username="srisanth",
            password_hash=get_password_hash("23ITA55"),
            department="IT",
            class_name="A",
            year="4th / A",
            mentor_id=mentor2.id,
            phone_leave_used=False
        )
        db.add(student4)
    
    db.commit()
    db.close()
    return {"message": "Seed data created successfully"}


@app.get("/api/template")
def get_template():
    template_dir = os.path.normpath(os.path.join(os.getcwd(), "assets", "leave-form"))
    template_path = os.path.join(template_dir, "leave-form-template-saraswathi.html")
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")
    return FileResponse(template_path, media_type="text/html")


@app.get("/api/template/{mentor_name}")
def get_template_by_mentor(mentor_name: str):
    template_dir = os.path.normpath(os.path.join(os.getcwd(), "assets", "leave-form"))
    if "periya" in mentor_name.lower() or "nayaki" in mentor_name.lower():
        template_path = os.path.join(template_dir, "leave-form-template-periya-nayaki.html")
    else:
        template_path = os.path.join(template_dir, "leave-form-template-saraswathi.html")
    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail="Template not found")
    return FileResponse(template_path, media_type="text/html")


@app.get("/api/template-image")
def get_template_image():
    template_dir = os.path.normpath(os.path.join(os.getcwd(), "assets", "leave-form"))
    jpg_path = os.path.join(template_dir, "empty-leave-form.jpg")
    png_path = os.path.join(template_dir, "empty-leave-form.png")
    if os.path.exists(jpg_path):
        return FileResponse(jpg_path, media_type="image/jpeg")
    elif os.path.exists(png_path):
        return FileResponse(png_path, media_type="image/png")
    raise HTTPException(status_code=404, detail="Template image not found")


frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
