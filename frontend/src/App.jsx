import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import MentorDashboard from './pages/MentorDashboard'
import ApplyLeave from './pages/ApplyLeave'
import LeavePreview from './pages/LeavePreview'
import ApplicationDetails from './pages/ApplicationDetails'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function ProtectedRoute({ children, allowedTypes }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (!allowedTypes.includes(user.user_type)) return <Navigate to="/login" />
  
  return children
}

function AppLayout({ children, userType }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userType={userType} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/student" element={
        <ProtectedRoute allowedTypes={['student']}>
          <AppLayout userType="student">
            <StudentDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/apply" element={
        <ProtectedRoute allowedTypes={['student']}>
          <AppLayout userType="student">
            <ApplyLeave />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student/preview" element={
        <ProtectedRoute allowedTypes={['student']}>
          <AppLayout userType="student">
            <LeavePreview />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/mentor" element={
        <ProtectedRoute allowedTypes={['mentor']}>
          <AppLayout userType="mentor">
            <MentorDashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/mentor/applications/:id" element={
        <ProtectedRoute allowedTypes={['mentor']}>
          <AppLayout userType="mentor">
            <ApplicationDetails />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
