# Digital Leave Management System

A web-based leave management system for the IT Department - A, Final Year.

## Features

- **Student Module**: Login, select mentor, apply for leave (Phone Leave / Informal Leave), view application history
- **Mentor Module**: Login, view applications, approve/reject applications, print individual or all applications
- **Phone Leave Restriction**: Enforces one-time usage per student
- **Document Generation**: Generates leave letters with student details and signatures
- **Role-based Authentication**: Separate access for students and mentors

## Tech Stack

### Backend
- FastAPI
- SQLite
- SQLAlchemy
- JWT Authentication

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

The backend will run at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:3000`

### Seed Data

Visit `http://localhost:8000/api/seed` to create demo data.

## Demo Credentials

### Mentors
- Username: `saraswathi`, Password: `sar@123`
- Username: `periyanayaki`, Password: `per@123`

### Students
- Username is the name in lowercase without spaces
- Password is the roll number
- Example: `AATHEESWARI T` → username: `aatheeswarit`, password: `23ITA01`

## Workflow

1. Student logs in
2. Student selects a mentor
3. Student chooses leave type (Phone Leave / Informal Leave)
4. Student fills leave details and signatures
5. Student previews the leave form
6. Student submits the application
7. Mentor views the application in their dashboard
8. Mentor approves/rejects the application
9. Mentor can print the leave form

## Project Structure

```
leave/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── auth.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── mentors.py
│   │   │   ├── students.py
│   │   │   └── applications.py
│   │   └── services/
│   │       ├── document_service.py
│   │       └── validation_service.py
│   ├── assets/
│   │   └── leave-form/
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── MentorDashboard.jsx
│   │   │   ├── ApplyLeave.jsx
│   │   │   ├── LeavePreview.jsx
│   │   │   └── ApplicationDetails.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
└── README.md
```
