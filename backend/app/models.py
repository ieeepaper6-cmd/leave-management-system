from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    roll_number = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    department = Column(String, nullable=False)
    class_name = Column(String, nullable=False)
    year = Column(String, nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=True)
    phone_leave_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    mentor = relationship("Mentor", back_populates="students")
    applications = relationship("LeaveApplication", back_populates="student")


class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    department = Column(String, nullable=False)
    class_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    students = relationship("Student", back_populates="mentor")
    applications = relationship("LeaveApplication", back_populates="mentor")


class LeaveApplication(Base):
    __tablename__ = "leave_applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    student_name = Column(String, nullable=False)
    roll_number = Column(String, nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=False)
    mentor_name = Column(String, nullable=False)
    leave_type = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    leave_date = Column(String, nullable=True)
    from_date = Column(String, nullable=True)
    to_date = Column(String, nullable=True)
    student_signature = Column(String, nullable=True)
    parent_signature = Column(String, nullable=True)
    hod_signature = Column(String, nullable=True)
    mentor_signature = Column(String, nullable=True)
    days_leave_availed = Column(String, nullable=True)
    days_absent = Column(String, nullable=True)
    days_absent_test = Column(String, nullable=True)
    phone_leave = Column(String, nullable=True)
    generated_document = Column(String, nullable=True)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("Student", back_populates="applications")
    mentor = relationship("Mentor", back_populates="applications")
