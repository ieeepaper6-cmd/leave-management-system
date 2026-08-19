import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Printer } from 'lucide-react'
import { API_URL } from '../context/AuthContext'

export default function ApplicationDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [templateHtml, setTemplateHtml] = useState('')

  useEffect(() => {
    fetchApplication()
  }, [id])

  useEffect(() => {
    if (application && application.mentor_name) {
      fetchTemplate()
    }
  }, [application])

  const fetchApplication = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`http://localhost:8000/api/applications/mentor/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setApplication(res.data)
    } catch (error) {
      toast.error('Failed to fetch application details')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplate = async () => {
    try {
      const res = await axios.get(`${API_URL}/template/${encodeURIComponent(application.mentor_name)}`, { responseType: 'text' })
      setTemplateHtml(res.data)
    } catch (error) {
      console.error('Failed to load template')
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <html>
        <head>
          <title>Print Leave Application</title>
          <style>
            * { box-sizing: border-box; }
            html, body { margin: 0; padding: 0; background: #ffffff; }
            body { font-family: "Times New Roman", Times, serif; color: #000000; }
            .leave-form { position: relative; width: 1080px; height: 706px; margin: 0 auto; background: #ffffff; overflow: hidden; }
            .header { position: absolute; top: 30px; left: 0; width: 100%; text-align: center; }
            .college-name { font-size: 21px; line-height: 24px; font-weight: normal; }
            .autonomous { margin-top: 0px; font-size: 20px; line-height: 25px; }
            .department { margin-top: 0px; font-size: 20px; line-height: 25px; }
            .form-title { margin-top: 0px; font-size: 20px; line-height: 25px; font-weight: bold; }
            .main-content { position: absolute; top: 164px; left: 126px; width: 780px; font-size: 19px; line-height: 27px; }
            .form-row { position: relative; height: 27px; white-space: nowrap; }
            .student-name { position: absolute; left: 0; top: 0; }
            .year-section { position: absolute; right: 34px; top: 0; }
            .roll-number { position: absolute; left: 0; top: 27px; }
            .roll-colon { position: absolute; left: 190px; top: 27px; }
            .days-applied { position: absolute; left: 0; top: 54px; }
            .days-colon { position: absolute; left: 260px; top: 54px; }
            .days-line { position: absolute; left: 266px; top: 70px; width: 112px; border-bottom: 1px solid #000000; }
            .from-text { position: absolute; left: 382px; top: 54px; }
            .from-line { position: absolute; left: 438px; top: 70px; width: 130px; border-bottom: 1px solid #000000; }
            .to-text { position: absolute; left: 574px; top: 54px; }
            .to-line { position: absolute; left: 629px; top: 70px; width: 126px; border-bottom: 1px solid #000000; }
            .reason { position: absolute; left: 0; top: 81px; }
            .reason-colon { position: absolute; left: 260px; top: 81px; }
            .reason-line { position: absolute; left: 266px; top: 97px; width: 515px; border-bottom: 1px solid #000000; }
            .leave-availed { position: absolute; left: 0; top: 108px; }
            .days-absent { position: absolute; left: 0; top: 135px; }
            .test-absent { position: absolute; left: 0; top: 162px; }
            .phone-leave { position: absolute; left: 0; top: 189px; }
            .signature-section { position: absolute; top: 420px; left: 126px; width: 780px; font-size: 19px; line-height: 24px; }
            .student-signature { position: absolute; left: 0; top: 0; }
            .parent-signature { position: absolute; right: 0; top: 0; }
            .approval-section { position: absolute; top: 517px; left: 126px; width: 780px; font-size: 19px; line-height: 24px; }
            .mentor-section { position: absolute; left: 0; top: 0; }
            .mentor-name { margin-top: 6px; margin-left: 28px; }
            .class-section { position: absolute; right: 0; top: 0; }
            .class-name { margin-top: 6px; margin-left: 60px; }
            .bottom-section { position: absolute; top: 646px; left: 126px; width: 780px; font-size: 19px; line-height: 24px; }
            .hod-section { position: absolute; left: 0; top: 0; }
            .hod-name { margin-top: 6px; margin-left: 0; }
            .principal { position: absolute; right: 0; top: 0; font-weight: bold; }
            @media print {
                @page { size: 1080px 706px; margin: 0; }
                html, body { width: 1080px; height: 706px; margin: 0; padding: 0; background: #ffffff; }
                .leave-form { width: 1080px; height: 706px; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="leave-form">
            <div class="header">
              <div class="college-name">Velammal College of Engineering and Technology, Madurai</div>
              <div class="autonomous">(Autonomous)</div>
              <div class="department">Department of Information Technology</div>
              <div class="form-title">Student's Leave Form</div>
            </div>
            <div class="main-content">
              <div class="student-name">Name of the Student:</div>
              <div class="year-section">Year/Section:</div>
              <div class="roll-number">Roll Number</div>
              <div class="roll-colon">:</div>
              <div class="days-applied">Number of Days Applied</div>
              <div class="days-colon">:</div>
              <div class="days-line"></div>
              <div class="from-text">From:</div>
              <div class="from-line"></div>
              <div class="to-text">To:</div>
              <div class="to-line"></div>
              <div class="reason">Reason for leave</div>
              <div class="reason-colon">:</div>
              <div class="reason-line"></div>
              <div class="leave-availed">Number of days leave availed already:</div>
              <div class="days-absent">Number of days absent:</div>
              <div class="test-absent">Number of days absent for test already:</div>
              <div class="phone-leave">Number of days leave applied through phone (0/1):</div>
            </div>
            <div class="signature-section">
              <div class="student-signature">Signature of Student</div>
              <div class="parent-signature">Signature of Parent</div>
            </div>
            <div class="approval-section">
              <div class="mentor-section">
                <div>Name and Signature of Mentor</div>
                <div class="mentor-name">${application.mentor_name || ''}</div>
              </div>
              <div class="class-section">
                <div>Name and Signature of Class Incharge</div>
                <div class="class-name">Mrs. A. Periya Nayaki</div>
              </div>
            </div>
            <div class="bottom-section">
              <div class="hod-section">
                <div>HoD/IT</div>
                <div class="hod-name">Dr. R.Kavitha, Prof & Head/IT</div>
              </div>
              <div class="principal">Principal</div>
            </div>

            <div style="position: absolute; left: 310px; top: 165px; width: 330px; height: 25px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.student_name || ''}
            </div>
            <div style="position: absolute; left: 790px; top: 165px; width: 120px; height: 25px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              4th / A
            </div>
            <div style="position: absolute; left: 330px; top: 192px; width: 220px; height: 25px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.roll_number || ''}
            </div>
            <div style="position: absolute; left: 392px; top: 210px; width: 112px; height: 20px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.leave_date ? formatDate(application.leave_date) : ''}
            </div>
            <div style="position: absolute; left: 568px; top: 210px; width: 130px; height: 20px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${displayFromDate}
            </div>
            <div style="position: absolute; left: 730px; top: 210px; width: 126px; height: 20px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${displayToDate}
            </div>
            <div style="position: absolute; left: 392px; top: 240px; width: 515px; height: 20px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.reason || ''}
            </div>
            <div style="position: absolute; left: 410px; top: 274px; width: 490px; height: 25px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.days_leave_availed || ''}
            </div>
            <div style="position: absolute; left: 320px; top: 301px; width: 580px; height: 25px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.days_absent || ''}
            </div>
            <div style="position: absolute; left: 490px; top: 328px; width: 410px; height: 25px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.days_absent_test || ''}
            </div>
            <div style="position: absolute; left: 565px; top: 355px; width: 335px; height: 25px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.phone_leave || ''}
            </div>
            <div style="position: absolute; left: 126px; top: 450px; width: 250px; height: 35px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.student_signature || ''}
            </div>
            <div style="position: absolute; left: 760px; top: 450px; width: 150px; height: 35px; font-family: 'Times New Roman', Times, serif; font-size: 19px; color: #000;">
              ${application.parent_signature || ''}
            </div>
          </div>
        </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!application) {
    return <div className="text-center py-8">Application not found</div>
  }

  const displayFromDate = formatDate(application.from_date)
  const displayToDate = formatDate(application.to_date)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/mentor')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
              <p className="text-sm text-gray-500">Application #{application.id}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
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
            
            {/* Dynamic overlays - same as LeavePreview */}
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
                {application.student_name}
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
                {application.roll_number}
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
                {application.leave_date ? formatDate(application.leave_date) : ''}
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
                {application.reason}
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
                {application.days_leave_availed || ''}
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
                {application.days_absent || ''}
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
                {application.days_absent_test || ''}
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
                {application.phone_leave || ''}
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
                {application.student_signature}
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
                {application.parent_signature}
              </div>
            </div>
          </div>
        </div>

        <div className="border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                application.status === 'Approved' ? 'bg-green-100 text-green-800' :
                application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {application.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submission Date</p>
              <p className="font-medium text-gray-900">
                {application.created_at ? new Date(application.created_at).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Leave Type</p>
              <p className="font-medium text-gray-900">{application.leave_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mentor</p>
              <p className="font-medium text-gray-900">{application.mentor_name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
