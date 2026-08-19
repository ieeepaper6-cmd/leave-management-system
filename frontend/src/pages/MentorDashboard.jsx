import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../context/AuthContext'
import { Eye, Printer, Check, X } from 'lucide-react'

export default function MentorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      
      const [statsRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/mentors/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/applications/mentor/applications`, { headers })
      ])
      
      setStats(statsRes.data)
      setApplications(appsRes.data)
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/applications/mentor/applications/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Application approved')
      fetchData()
    } catch (error) {
      toast.error('Failed to approve application')
    }
  }

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`${API_URL}/applications/mentor/applications/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Application rejected')
      fetchData()
    } catch (error) {
      toast.error('Failed to reject application')
    }
  }

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank')
    const printContent = applications.map(app => `
      <div style="page-break-after: always; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; margin-bottom: 20px;">LEAVE APPLICATION</h2>
        <p><strong>Name:</strong> ${app.student_name}</p>
        <p><strong>Roll Number:</strong> ${app.roll_number}</p>
        <p><strong>Mentor:</strong> ${app.mentor_name}</p>
        <p><strong>Leave Type:</strong> ${app.leave_type}</p>
        <p><strong>Date:</strong> ${app.leave_date || app.from_date || '-'}</p>
        <p><strong>Reason:</strong> ${app.reason}</p>
        <p><strong>Status:</strong> ${app.status}</p>
      </div>
    `).join('')
    
    printWindow.document.write(`
      <html>
        <head><title>Print All Leave Applications</title></head>
        <body>${printContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status.toLowerCase() === filter.toLowerCase())

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Applications', value: stats.total, color: 'bg-blue-500' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-500' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
              <span className="text-white text-xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Student Applications</h2>
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print All
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredApplications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No applications found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Student</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Roll No</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Leave Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-sm text-gray-900">{app.student_name}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{app.roll_number}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{app.leave_type}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {app.leave_date || app.from_date || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/mentor/applications/${app.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {app.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
