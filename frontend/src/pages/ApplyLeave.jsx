import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../context/AuthContext'
import { ArrowLeft } from 'lucide-react'

export default function ApplyLeave() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    leave_type: '',
    reason: '',
    leave_date: '',
    from_date: '',
    to_date: '',
    student_signature: '',
    parent_signature: '',
    days_leave_availed: '',
    days_absent: '',
    days_absent_test: '',
    phone_leave: ''
  })
  const [student, setStudent] = useState(null)

  useEffect(() => {
    fetchStudentData()
  }, [])

  useEffect(() => {
    if (location.state?.formData) {
      setFormData(location.state.formData)
    }
  }, [location.state])

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/students/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudent(res.data)
      if (!res.data.mentor_id) {
        toast.error('Please select a mentor first')
        navigate('/student')
      }
    } catch (error) {
      toast.error('Failed to fetch student data')
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validateForm = () => {
    if (!formData.leave_type) {
      toast.error('Please select a leave type')
      return false
    }
    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for leave')
      return false
    }
    if (!formData.leave_date && !formData.from_date) {
      toast.error('Please provide leave date')
      return false
    }
    if (!formData.student_signature.trim()) {
      toast.error('Please provide student signature')
      return false
    }
    if (!formData.parent_signature.trim()) {
      toast.error('Please provide parent signature')
      return false
    }
    return true
  }

  const handlePreview = (e) => {
    e.preventDefault()
    if (validateForm()) {
      navigate('/student/preview', { state: { formData, student } })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const formPayload = new FormData()
      formPayload.append('leave_type', formData.leave_type)
      formPayload.append('reason', formData.reason)
      if (formData.leave_date) formPayload.append('leave_date', formData.leave_date)
      if (formData.from_date) formPayload.append('from_date', formData.from_date)
      if (formData.to_date) formPayload.append('to_date', formData.to_date)
      formPayload.append('student_signature', formData.student_signature)
      formPayload.append('parent_signature', formData.parent_signature)
      formPayload.append('days_leave_availed', formData.days_leave_availed)
      formPayload.append('days_absent', formData.days_absent)
      formPayload.append('days_absent_test', formData.days_absent_test)
      formPayload.append('phone_leave', formData.phone_leave)

      await axios.post(`${API_URL}/applications/`, formPayload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      toast.success('Leave application submitted successfully')
      navigate('/student')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (!student) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/student')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apply for Leave</h1>
            <p className="text-sm text-gray-500">Fill in the required details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
              <input
                type="text"
                value={student.name}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
              <input
                type="text"
                value={student.roll_number}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <input
                type="text"
                value={student.department}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <input
                type="text"
                value={student.class_name}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="text"
                value={student.year}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mentor</label>
              <input
                type="text"
                value={student.mentor_name || 'Not selected'}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, leave_type: 'Phone Leave' }))}
                disabled={student.phone_leave_used}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.leave_type === 'Phone Leave'
                    ? 'border-blue-500 bg-blue-50'
                    : student.phone_leave_used
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium">Phone Leave</p>
                {student.phone_leave_used && (
                  <p className="text-xs text-red-600 mt-1">Already Used</p>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, leave_type: 'Informal Leave' }))}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.leave_type === 'Informal Leave'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium">Informal Leave</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave *</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter reason for leave"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leave Date</label>
              <input
                type="date"
                name="leave_date"
                value={formData.leave_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                name="from_date"
                value={formData.from_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                name="to_date"
                value={formData.to_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Signature *</label>
              <input
                type="text"
                name="student_signature"
                value={formData.student_signature}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your name as signature"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent Signature *</label>
              <input
                type="text"
                name="parent_signature"
                value={formData.parent_signature}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type parent name as signature"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days Leave Availed Already</label>
              <input
                type="text"
                name="days_leave_availed"
                value={formData.days_leave_availed}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days Absent</label>
              <input
                type="text"
                name="days_absent"
                value={formData.days_absent}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of days"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days Absent for Test Already</label>
              <input
                type="text"
                name="days_absent_test"
                value={formData.days_absent_test}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days Leave Applied Through Phone</label>
              <input
                type="text"
                name="phone_leave"
                value={formData.phone_leave}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of days"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handlePreview}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Preview Leave Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
