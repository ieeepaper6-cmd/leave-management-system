import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../context/AuthContext'
import { User, Users, FileText, Calendar, LogOut, Plus } from 'lucide-react'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [mentors, setMentors] = useState([])
  const [selectedMentor, setSelectedMentor] = useState('')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      
      const [studentRes, mentorsRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/students/me`, { headers }),
        axios.get(`${API_URL}/mentors/`, { headers }),
        axios.get(`${API_URL}/students/applications`, { headers })
      ])
      
      setStudent(studentRes.data)
      setMentors(mentorsRes.data)
      setApplications(appsRes.data)
      
      if (studentRes.data.mentor_id) {
        setSelectedMentor(studentRes.data.mentor_id.toString())
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMentorSelect = async (mentorId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/mentors/select-mentor/${mentorId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedMentor(mentorId.toString())
      const selectedMentorObj = mentors.find(m => m.id === mentorId)
      setStudent(prev => ({ ...prev, mentor_id: mentorId, mentor_name: selectedMentorObj?.name || prev.mentor_name }))
      toast.success('Mentor selected successfully')
    } catch (error) {
      toast.error('Failed to select mentor')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  const stats = [
    { label: 'Total Applications', value: applications.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending', value: applications.filter(a => a.status === 'Pending').length, icon: Calendar, color: 'bg-yellow-500' },
    { label: 'Approved', value: applications.filter(a => a.status === 'Approved').length, icon: FileText, color: 'bg-green-500' },
    { label: 'Rejected', value: applications.filter(a => a.status === 'Rejected').length, icon: FileText, color: 'bg-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{student?.name}</p></div>
          <div><p className="text-sm text-gray-500">Roll Number</p><p className="font-medium">{student?.roll_number}</p></div>
          <div><p className="text-sm text-gray-500">Department</p><p className="font-medium">{student?.department}</p></div>
          <div><p className="text-sm text-gray-500">Class</p><p className="font-medium">{student?.class_name}</p></div>
          <div><p className="text-sm text-gray-500">Year</p><p className="font-medium">{student?.year}</p></div>
          <div><p className="text-sm text-gray-500">Mentor</p><p className="font-medium">{student?.mentor_name || 'Not selected'}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Mentor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              onClick={() => handleMentorSelect(mentor.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedMentor === mentor.id.toString()
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{mentor.name}</p>
                  <p className="text-sm text-gray-500">{mentor.department} - {mentor.class_name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/student/apply')}
          disabled={!selectedMentor}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-5 h-5" />
          Apply for Leave
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Leave Applications</h2>
        {applications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No applications yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Leave Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mentor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {app.leave_date || app.from_date || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{app.leave_type}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{app.mentor_name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
