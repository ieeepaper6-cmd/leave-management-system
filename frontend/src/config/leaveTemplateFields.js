export const TEMPLATE_ORIGINAL_WIDTH = 1080
export const TEMPLATE_ORIGINAL_HEIGHT = 706

export const leaveTemplateFields = {
  // Student Information - aligned with "Name of the Student:"
  studentName: { x: 450, y: 175, width: 350, height: 25, fontSize: 13, fontWeight: 'normal' },
  
  // Roll Number - aligned with "Roll Number :"
  rollNumber: { x: 380, y: 202, width: 300, height: 25, fontSize: 13, fontWeight: 'normal' },
  
  // Year/Section - right side top
  yearSection: { x: 750, y: 175, width: 250, height: 25, fontSize: 13, fontWeight: 'normal' },
  
  // Leave dates section - "Number of Days Applied : ___ From: ___ To: ___"
  numberOfDays: { x: 500, y: 229, width: 60, height: 22, fontSize: 12, fontWeight: 'normal' },
  fromDate: { x: 610, y: 229, width: 100, height: 22, fontSize: 12, fontWeight: 'normal' },
  toDate: { x: 780, y: 229, width: 100, height: 22, fontSize: 12, fontWeight: 'normal' },
  
  // Reason for leave (Multi-line text area)
  reason: { x: 470, y: 258, width: 500, height: 60, fontSize: 12, fontWeight: 'normal' },
  
  // Leave statistics
  daysLeaveavailed: { x: 470, y: 284, width: 200, height: 20, fontSize: 11, fontWeight: 'normal' },
  daysAbsent: { x: 470, y: 310, width: 200, height: 20, fontSize: 11, fontWeight: 'normal' },
  daysAbsentTest: { x: 470, y: 336, width: 200, height: 20, fontSize: 11, fontWeight: 'normal' },
  phoneLeaveApplied: { x: 380, y: 362, width: 60, height: 20, fontSize: 11, fontWeight: 'normal' },
  
  // Signature area - "Signature of Student" and "Signature of Parent"
  studentSignature: { x: 200, y: 440, width: 200, height: 40, fontSize: 12, fontWeight: 'normal' },
  parentSignature: { x: 750, y: 440, width: 200, height: 40, fontSize: 12, fontWeight: 'normal' },
  
  // Mentor and Class Incharge signatures
  mentorSignature: { x: 200, y: 540, width: 250, height: 30, fontSize: 11, fontWeight: 'normal' },
  classInchargeSignature: { x: 650, y: 540, width: 280, height: 30, fontSize: 11, fontWeight: 'normal' },
  
  // Bottom signatures - HOD/IT and Principal
  hodSignature: { x: 200, y: 660, width: 250, height: 30, fontSize: 11, fontWeight: 'normal' },
  principalSignature: { x: 750, y: 660, width: 200, height: 30, fontSize: 11, fontWeight: 'normal' },
}
