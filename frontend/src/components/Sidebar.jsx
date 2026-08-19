import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, FileText, History, User, LogOut, Printer } from 'lucide-react'

export default function Sidebar({ userType }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/apply', icon: FileText, label: 'Apply Leave' },
    { to: '/student', icon: History, label: 'My Applications' },
  ]

  const mentorLinks = [
    { to: '/mentor', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/mentor', icon: FileText, label: 'Applications' },
  ]

  const links = userType === 'student' ? studentLinks : mentorLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Digital Leave Management</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
