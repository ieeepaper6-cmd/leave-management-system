import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Edit, Download, Printer } from 'lucide-react'
import { API_URL } from '../context/AuthContext'

export default function LeavePreview() {
  const location = useLocation()
  const navigate = useNavigate()
  const { formData, student } = location.state || {}
  const [loading, setLoading] = useState(false)
  const [templateHtml, setTemplateHtml] = useState('')
  const [mentorName, setMentorName] = useState('')

  useEffect(() => {
    if (!formData || !student) {
      navigate('/student/apply')
      return
    }
    setMentorName(student.mentor_name || '')
  }, [formData, student, navigate])

  useEffect(() => {
    if (!mentorName) return
    loadTemplate()
  }, [mentorName])

  const loadTemplate = async () => {
    try {
      const res = await axios.get(`${API_URL}/template/${encodeURIComponent(mentorName)}`, { responseType: 'text' })
      setTemplateHtml(res.data)
    } catch (error) {
      toast.error('Failed to load template')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const handleEdit = () => {
    navigate('/student/apply')
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSubmit = async () => {
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
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Leave application submitted successfully')
      navigate('/student')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (!formData || !student) {
    return <div>Loading...</div>
  }

  const displayFromDate = formatDate(formData.from_date)
  const displayToDate = formatDate(formData.to_date)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student/apply')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Form Preview</h1>
              <p className="text-sm text-gray-500">Review your application before submission</p>
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Form
          </button>
        </div>

        <div className="border-2 border-gray-200 rounded-lg p-4 mb-6 overflow-auto">
          <div 
            className="relative"
            style={{ 
              width: '1080px',
              height: '706px',
              margin: '0 auto',
              transform: 'scale(1)',
              transformOrigin: 'top center'
            }}
          >
            {templateHtml && (
              <div 
                dangerouslySetInnerHTML={{ __html: templateHtml }}
                style={{ 
                  width: '1080px',
                  height: '706px',
                  position: 'relative'
                }}
              />
            )}
            
            {/* Dynamic overlays - positions based on official template coordinates */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              
              {/* Name of the Student - X=310, Y=165 */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '310px', 
                  top: '165px',
                  width: '330px',
                  height: '25px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {student.name}
              </div>
              
              {/* Year/Section - X=790, Y=165 - permanently 4th / A */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '790px', 
                  top: '165px',
                  width: '120px',
                  height: '25px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                4th / A
              </div>
              
              {/* Roll Number - X=330, Y=192 */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '330px', 
                  top: '192px',
                  width: '220px',
                  height: '25px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {student.roll_number}
              </div>
              
              {/* Number of Days Applied - X=392, Y=210 (above line at 234) */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '392px', 
                  top: '210px',
                  width: '112px',
                  height: '20px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {formData.days_applied || ''}
              </div>
              
              {/* From Date - X=568, Y=210 (above line at 234) */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '568px', 
                  top: '210px',
                  width: '130px',
                  height: '20px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {displayFromDate}
              </div>
              
              {/* To Date - X=730, Y=210 (above line at 234) */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '730px', 
                  top: '210px',
                  width: '126px',
                  height: '20px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {displayToDate}
              </div>
              
              {/* Reason for Leave - X=392, Y=240 (above line at 261) */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '392px', 
                  top: '240px',
                  width: '515px',
                  height: '20px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {formData.reason}
              </div>
              
              {/* Days Leave Availed Already - X=410, Y=274 - near label */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '410px', 
                  top: '274px',
                  width: '490px',
                  height: '25px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {formData.days_leave_availed || ''}
              </div>
              
              {/* Number of Days Absent - X=320, Y=301 - near label */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '320px', 
                  top: '301px',
                  width: '580px',
                  height: '25px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {formData.days_absent || ''}
              </div>
              
              {/* Days Absent for Test - X=490, Y=328 - near label */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '490px', 
                  top: '328px',
                  width: '410px',
                  height: '25px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {formData.days_absent_test || ''}
              </div>
              
              {/* Leave Applied Through Phone - X=565, Y=355 - near label */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '565px', 
                  top: '355px',
                  width: '335px',
                  height: '25px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {formData.phone_leave || ''}
              </div>
              
              {/* Student Signature - X=126, Y=450 (below label at 418) */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '126px', 
                  top: '450px',
                  width: '250px',
                  height: '35px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {formData.student_signature}
              </div>
              
              {/* Parent Signature - X=760, Y=450 (below label at 418) */}
              <div 
                className="absolute text-[19px] text-black font-normal"
                style={{ 
                  left: '760px', 
                  top: '450px',
                  width: '150px',
                  height: '35px',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                {formData.parent_signature}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={loading}
            className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {loading ? 'Generating...' : 'Download PDF'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Leave'}
          </button>
        </div>
      </div>
    </div>
  )
}
