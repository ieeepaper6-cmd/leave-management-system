from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class StudentBase(BaseModel):
    name: str
    roll_number: str
    username: str
    department: str
    class_name: str
    year: str
    mentor_id: Optional[int] = None
    mentor_name: Optional[str] = None
    phone_leave_used: bool = False


class StudentCreate(StudentBase):
    password: str


class StudentLogin(BaseModel):
    username: str
    password: str


class StudentResponse(StudentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MentorBase(BaseModel):
    name: str
    username: str
    department: str
    class_name: str


class MentorCreate(MentorBase):
    password: str


class MentorLogin(BaseModel):
    username: str
    password: str


class MentorResponse(MentorBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LeaveApplicationBase(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    mentor_id: int
    mentor_name: str
    leave_type: str
    reason: str
    leave_date: Optional[str] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    student_signature: Optional[str] = None
    parent_signature: Optional[str] = None
    hod_signature: Optional[str] = None
    mentor_signature: Optional[str] = None
    days_leave_availed: Optional[str] = None
    days_absent: Optional[str] = None
    days_absent_test: Optional[str] = None
    phone_leave: Optional[str] = None
    generated_document: Optional[str] = None
    status: str = "Pending"


class LeaveApplicationCreate(LeaveApplicationBase):
    pass


class LeaveApplicationResponse(LeaveApplicationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    user_id: int
    name: str
