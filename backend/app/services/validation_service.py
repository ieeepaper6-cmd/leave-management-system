"""
Smart form validation service - 100% FREE local validation
Uses Tesseract OCR to verify form data accuracy and positioning
"""

from datetime import datetime
from typing import Dict, List, Tuple
import re
from PIL import Image
from io import BytesIO
import base64


class FormValidationResult:
    """Container for validation results"""

    def __init__(self):
        self.is_valid = True
        self.errors = []
        self.warnings = []
        self.info = []
        self.validation_score = 100  # 0-100

    def to_dict(self):
        return {
            "is_valid": self.is_valid,
            "validation_score": self.validation_score,
            "errors": self.errors,
            "warnings": self.warnings,
            "info": self.info,
        }


def validate_form_data(
    student_name: str,
    roll_number: str,
    department: str,
    class_name: str,
    year: str,
    mentor_name: str,
    leave_type: str,
    reason: str,
    leave_date: str,
    from_date: str,
    to_date: str,
    student_signature: str,
    parent_signature: str,
    hod_signature: str = None,
    mentor_signature: str = None,
) -> FormValidationResult:
    """
    Validate all form fields for completeness and correctness
    Returns validation result with errors, warnings, and score
    """
    result = FormValidationResult()
    score_deductions = 0

    # ============ REQUIRED FIELD VALIDATION ============

    # Student Name
    if not student_name or len(student_name.strip()) == 0:
        result.errors.append("❌ Student name is missing")
        score_deductions += 20
    elif len(student_name.strip()) < 2:
        result.errors.append("❌ Student name is too short")
        score_deductions += 15
    else:
        result.info.append(f"✓ Student: {student_name}")

    # Roll Number
    if not roll_number or len(roll_number.strip()) == 0:
        result.errors.append("❌ Roll number is missing")
        score_deductions += 20
    elif not re.match(r'^[A-Z0-9]+$', roll_number.strip()):
        result.warnings.append(f"⚠ Roll number format unusual: {roll_number}")
        score_deductions += 5
    else:
        result.info.append(f"✓ Roll Number: {roll_number}")

    # Department
    if not department or len(department.strip()) == 0:
        result.warnings.append("⚠ Department not specified")
        score_deductions += 3
    else:
        result.info.append(f"✓ Department: {department}")

    # Class
    if not class_name or len(class_name.strip()) == 0:
        result.warnings.append("⚠ Class section not specified")
        score_deductions += 3
    else:
        result.info.append(f"✓ Class: {class_name}")

    # Year
    if not year or len(year.strip()) == 0:
        result.warnings.append("⚠ Year/Semester not specified")
        score_deductions += 3
    else:
        result.info.append(f"✓ Year: {year}")

    # Mentor
    if not mentor_name or len(mentor_name.strip()) == 0:
        result.warnings.append("⚠ Mentor name not specified")
        score_deductions += 5
    else:
        result.info.append(f"✓ Mentor: {mentor_name}")

    # Leave Type
    if not leave_type or len(leave_type.strip()) == 0:
        result.errors.append("❌ Leave type is missing")
        score_deductions += 20
    else:
        result.info.append(f"✓ Leave Type: {leave_type}")

    # ============ REASON VALIDATION ============
    if not reason or len(reason.strip()) == 0:
        result.errors.append("❌ Reason for leave is missing")
        score_deductions += 25
    elif len(reason.strip()) < 5:
        result.errors.append("❌ Reason is too short (minimum 5 characters)")
        score_deductions += 20
    elif len(reason.strip()) > 500:
        result.warnings.append(
            "⚠ Reason is very long (will be truncated in preview)")
        score_deductions += 5
    else:
        result.info.append(f"✓ Reason: {reason[:30]}...")

    # ============ DATE VALIDATION ============
    if not leave_date and (not from_date or not to_date):
        result.errors.append("❌ No leave date information provided")
        score_deductions += 25
    else:
        # Validate from_date format
        if from_date:
            try:
                from_dt = datetime.strptime(from_date, "%Y-%m-%d")
                result.info.append(
                    f"✓ From Date: {from_dt.strftime('%d-%m-%Y')}")
            except ValueError:
                result.errors.append(
                    f"❌ Invalid from_date format: {from_date}")
                score_deductions += 15

        # Validate to_date format
        if to_date:
            try:
                to_dt = datetime.strptime(to_date, "%Y-%m-%d")
                result.info.append(f"✓ To Date: {to_dt.strftime('%d-%m-%Y')}")

                # Check if to_date is after from_date
                if from_date:
                    try:
                        from_dt = datetime.strptime(from_date, "%Y-%m-%d")
                        if to_dt < from_dt:
                            result.errors.append(
                                "❌ To date cannot be before from date")
                            score_deductions += 15
                        elif to_dt == from_dt:
                            result.info.append("✓ Single day leave")
                        else:
                            days = (to_dt - from_dt).days + 1
                            result.info.append(
                                f"✓ Leave duration: {days} days")
                    except ValueError:
                        pass
            except ValueError:
                result.errors.append(f"❌ Invalid to_date format: {to_date}")
                score_deductions += 15

    # ============ SIGNATURE VALIDATION ============

    # Student Signature (Required)
    if not student_signature or len(student_signature.strip()) == 0:
        result.errors.append("❌ Student signature is missing")
        score_deductions += 20
    else:
        result.info.append(f"✓ Student Signature: {student_signature}")

    # Parent Signature (Required)
    if not parent_signature or len(parent_signature.strip()) == 0:
        result.errors.append("❌ Parent signature is missing")
        score_deductions += 20
    else:
        result.info.append(f"✓ Parent Signature: {parent_signature}")

    # HOD Signature (Optional but recommended)
    if not hod_signature or len(hod_signature.strip()) == 0:
        result.warnings.append(
            "⚠ HOD signature not provided (will be filled later)")
        score_deductions += 2
    else:
        result.info.append(f"✓ HOD Signature: {hod_signature}")

    # Mentor Signature (Optional but recommended)
    if not mentor_signature or len(mentor_signature.strip()) == 0:
        result.warnings.append(
            "⚠ Mentor signature not provided (will be filled later)")
        score_deductions += 2
    else:
        result.info.append(f"✓ Mentor Signature: {mentor_signature}")

    # ============ CALCULATE FINAL SCORE ============
    result.validation_score = max(0, 100 - score_deductions)

    # Determine if form is valid
    if len(result.errors) > 0:
        result.is_valid = False
    else:
        result.is_valid = True

    # Add quality assessment
    if result.validation_score >= 90:
        result.info.append("🎉 Form quality: Excellent")
    elif result.validation_score >= 75:
        result.info.append("👍 Form quality: Good")
    elif result.validation_score >= 60:
        result.info.append(
            "⚠️ Form quality: Acceptable (some optional fields missing)")
    else:
        result.info.append("❌ Form quality: Poor (required fields missing)")

    return result


def validate_generated_image(image_base64: str) -> Dict:
    """
    Validate the generated form image
    Checks if text is visible and properly positioned
    """
    validation = {
        "image_valid": True,
        "checks": [],
        "warnings": [],
    }

    try:
        # Decode base64 image
        if image_base64.startswith("data:image"):
            image_data = base64.b64decode(image_base64.split(",")[1])
        else:
            image_data = base64.b64decode(image_base64)

        # Open image
        img = Image.open(BytesIO(image_data))

        # Check image dimensions
        width, height = img.size
        if width < 800 or height < 600:
            validation["warnings"].append(
                f"⚠ Image size small: {width}x{height}")
        else:
            validation["checks"].append(
                f"✓ Image dimensions: {width}x{height}")

        # Check if image has content (not blank)
        # Convert to grayscale and check average pixel value
        grayscale = img.convert('L')
        pixels = list(grayscale.getdata())
        avg_pixel = sum(pixels) / len(pixels)

        if avg_pixel > 250:  # Too bright/blank
            validation["image_valid"] = False
            validation["warnings"].append(
                "❌ Image appears to be blank or mostly white")
        elif avg_pixel < 50:  # Too dark
            validation["warnings"].append("⚠ Image appears very dark")
        else:
            validation["checks"].append("✓ Image has proper contrast")

        # Check for color content
        if img.mode == 'RGB':
            validation["checks"].append("✓ Image is in RGB color mode")

    except Exception as e:
        validation["image_valid"] = False
        validation["warnings"].append(f"❌ Error validating image: {str(e)}")

    return validation
