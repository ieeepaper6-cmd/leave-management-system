from PIL import Image, ImageDraw, ImageFont
import base64
import os
from io import BytesIO
from datetime import datetime

# Template paths - relative to backend working directory
TEMPLATE_DIR = os.path.normpath(
    os.path.join(os.getcwd(), "assets", "leave-form"))
DEFAULT_TEMPLATE_PATH = os.path.join(TEMPLATE_DIR, "empty-leave-form.jpg")
FALLBACK_TEMPLATE_PATH = os.path.join(TEMPLATE_DIR, "empty-leave-form.png")


def get_template_path():
    if os.path.exists(DEFAULT_TEMPLATE_PATH):
        return DEFAULT_TEMPLATE_PATH
    elif os.path.exists(FALLBACK_TEMPLATE_PATH):
        return FALLBACK_TEMPLATE_PATH
    return None


def ensure_template_exists():
    os.makedirs(TEMPLATE_DIR, exist_ok=True)
    if not get_template_path():
        create_default_template()


def create_default_template():
    width, height = 1080, 706
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)

    try:
        font_title = ImageFont.truetype("arial.ttf", 24)
        font_header = ImageFont.truetype("arial.ttf", 20)
        font_label = ImageFont.truetype("arial.ttf", 16)
        font_bold = ImageFont.truetype("arialbd.ttf", 16)
        font_small = ImageFont.truetype("arial.ttf", 14)
    except Exception:
        font_title = ImageFont.load_default()
        font_header = ImageFont.load_default()
        font_label = ImageFont.load_default()
        font_bold = ImageFont.load_default()
        font_small = ImageFont.load_default()

    draw.rectangle([40, 40, width - 40, height - 40], outline="black", width=2)
    draw.rectangle([50, 50, width - 50, height - 50], outline="black", width=1)

    draw.text((width // 2, 70), "DEPARTMENT OF INFORMATION TECHNOLOGY",
              fill="black", font=font_title, anchor="mm")
    draw.text((width // 2, 110), "LEAVE APPLICATION",
              fill="black", font=font_header, anchor="mm")

    fields = [
        ("Name:", 150),
        ("Roll Number:", 200),
        ("Department:", 250),
        ("Class:", 300),
        ("Year:", 350),
        ("Mentor:", 400),
        ("Leave Type:", 450),
        ("Reason for Leave:", 500),
    ]

    for label, y in fields:
        draw.text((80, y), label, fill="black", font=font_bold)
        draw.line((200, y + 25, width - 80, y + 25), fill="gray", width=1)

    draw.text((80, 560), "Date of Leave:", fill="black", font=font_bold)
    draw.line((200, 585, width - 80, 585), fill="gray", width=1)

    y_sig = 610
    draw.text((80, y_sig), "Student Signature:", fill="black", font=font_bold)
    draw.line((200, y_sig + 25, width // 2 - 40,
              y_sig + 25), fill="gray", width=1)

    draw.text((width // 2 + 40, y_sig), "Parent Signature:",
              fill="black", font=font_bold)
    draw.line((width // 2 + 160, y_sig + 25, width -
              80, y_sig + 25), fill="gray", width=1)

    y_sig2 = 660
    draw.text((80, y_sig2), "HOD Signature:", fill="black", font=font_bold)
    draw.line((200, y_sig2 + 25, width // 2 - 40,
              y_sig2 + 25), fill="gray", width=1)

    draw.text((width // 2 + 40, y_sig2), "Mentor Signature:",
              fill="black", font=font_bold)
    draw.line((width // 2 + 160, y_sig2 + 25, width -
              80, y_sig2 + 25), fill="gray", width=1)

    img.save(DEFAULT_TEMPLATE_PATH, quality=95)


# Field positions for 1080x706 landscape form
FIELD_POSITIONS = {
    "studentName": {"x": 450, "y": 175},
    "rollNumber": {"x": 380, "y": 202},
    "yearSection": {"x": 750, "y": 175},
    "numberOfDays": {"x": 500, "y": 229},
    "fromDate": {"x": 610, "y": 229},
    "toDate": {"x": 780, "y": 229},
    "reason": {"x": 470, "y": 258},
    "daysLeaveavailed": {"x": 470, "y": 284},
    "daysAbsent": {"x": 470, "y": 310},
    "daysAbsentTest": {"x": 470, "y": 336},
    "phoneLeaveApplied": {"x": 380, "y": 362},
}

SIGNATURE_POSITIONS = {
    "student": {"x": 200, "y": 440},
    "parent": {"x": 750, "y": 440},
    "mentor": {"x": 200, "y": 540},
    "classIncharge": {"x": 650, "y": 540},
    "hod": {"x": 200, "y": 660},
    "principal": {"x": 750, "y": 660},
}


def place_signature(template, draw, signature, x, y, font):
    """Place signature text on the template."""
    if not signature:
        return
    try:
        text = str(signature)[:30]
        draw.text((x, y), text, fill="#1e40af", font=font)
    except Exception as e:
        print(f"Error placing signature: {e}")


def generate_leave_document(student_name, roll_number, department, class_name, year, mentor_name, leave_type, reason, leave_date, from_date, to_date, student_signature, parent_signature, days_leave_availed=None, days_absent=None, days_absent_test=None, phone_leave=None):
    """Generate a leave document by overlaying text on the template image."""
    ensure_template_exists()

    template_path = get_template_path()
    if not template_path:
        raise FileNotFoundError(
            "No leave form template found. Please upload a template first.")

    template = Image.open(template_path).convert("RGB")
    draw = ImageDraw.Draw(template)

    try:
        font_text = ImageFont.truetype("arial.ttf", 14)
        font_small = ImageFont.truetype("arial.ttf", 12)
    except Exception:
        font_text = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Place student information
    pos = FIELD_POSITIONS.get("studentName", {})
    draw.text((pos.get("x", 450), pos.get("y", 175)), str(
        student_name)[:50], fill="#1e40af", font=font_text)

    pos = FIELD_POSITIONS.get("rollNumber", {})
    draw.text((pos.get("x", 380), pos.get("y", 202)), str(
        roll_number)[:30], fill="#1e40af", font=font_text)

    pos = FIELD_POSITIONS.get("yearSection", {})
    draw.text((pos.get("x", 750), pos.get("y", 175)), str(
        year)[:30], fill="#1e40af", font=font_text)

    # Show from_date in numberOfDays field (formatted as DD-MM-YYYY)
    if from_date:
        from datetime import datetime
        try:
            from_dt = datetime.strptime(from_date, "%Y-%m-%d")
            formatted_date = from_dt.strftime("%d-%m-%Y")
            pos = FIELD_POSITIONS.get("numberOfDays", {})
            draw.text((pos.get("x", 500), pos.get("y", 229)),
                      formatted_date, fill="#1e40af", font=font_text)
        except Exception:
            pass

    # Place reason (multi-line, word-wrapped)
    pos = FIELD_POSITIONS.get("reason", {})
    reason_x = pos.get("x", 470)
    reason_y = pos.get("y", 258)
    max_width = 200  # Max pixels per line
    words = str(reason).split()
    lines = []
    current_line = ""
    for word in words:
        test_line = current_line + (" " if current_line else "") + word
        if draw.textbbox((0, 0), test_line, font=font_text)[2] < max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)

    for i, line in enumerate(lines[:3]):  # Limit to 3 lines
        draw.text((reason_x, reason_y + i * 18), line,
                  fill="#1e40af", font=font_small)

    # Place additional fields
    pos = FIELD_POSITIONS.get("daysLeaveavailed", {})
    if days_leave_availed:
        draw.text((pos.get("x", 470), pos.get("y", 284)), str(days_leave_availed), fill="#1e40af", font=font_small)

    pos = FIELD_POSITIONS.get("daysAbsent", {})
    if days_absent:
        draw.text((pos.get("x", 470), pos.get("y", 310)), str(days_absent), fill="#1e40af", font=font_small)

    pos = FIELD_POSITIONS.get("daysAbsentTest", {})
    if days_absent_test:
        draw.text((pos.get("x", 470), pos.get("y", 336)), str(days_absent_test), fill="#1e40af", font=font_small)

    pos = FIELD_POSITIONS.get("phoneLeaveApplied", {})
    if phone_leave:
        draw.text((pos.get("x", 380), pos.get("y", 362)), str(phone_leave), fill="#1e40af", font=font_small)

    # Place signatures
    place_signature(template, draw, student_signature,
                    SIGNATURE_POSITIONS["student"]["x"],
                    SIGNATURE_POSITIONS["student"]["y"], font_small)
    place_signature(template, draw, parent_signature,
                    SIGNATURE_POSITIONS["parent"]["x"],
                    SIGNATURE_POSITIONS["parent"]["y"], font_small)

    buffer = BytesIO()
    template.save(buffer, format="PNG")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"


def generate_preview_document(student_name, roll_number, department, class_name, year, mentor_name, leave_type, reason, leave_date, from_date, to_date, student_signature, parent_signature):
    """Generate a preview document with student and parent signatures only."""
    ensure_template_exists()

    template_path = get_template_path()
    if not template_path:
        raise FileNotFoundError(
            "No leave form template found. Please upload a template first.")

    template = Image.open(template_path).convert("RGB")
    draw = ImageDraw.Draw(template)

    try:
        font_text = ImageFont.truetype("arial.ttf", 14)
        font_small = ImageFont.truetype("arial.ttf", 12)
    except Exception:
        font_text = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Place student information
    pos = FIELD_POSITIONS.get("studentName", {})
    draw.text((pos.get("x", 450), pos.get("y", 175)), str(
        student_name)[:50], fill="#1e40af", font=font_text)

    pos = FIELD_POSITIONS.get("rollNumber", {})
    draw.text((pos.get("x", 380), pos.get("y", 202)), str(
        roll_number)[:30], fill="#1e40af", font=font_text)

    pos = FIELD_POSITIONS.get("yearSection", {})
    draw.text((pos.get("x", 750), pos.get("y", 175)), str(
        year)[:30], fill="#1e40af", font=font_text)

    # Show from_date in numberOfDays field (formatted as DD-MM-YYYY)
    if from_date:
        from datetime import datetime
        try:
            from_dt = datetime.strptime(from_date, "%Y-%m-%d")
            formatted_date = from_dt.strftime("%d-%m-%Y")
            pos = FIELD_POSITIONS.get("numberOfDays", {})
            draw.text((pos.get("x", 500), pos.get("y", 229)),
                      formatted_date, fill="#1e40af", font=font_text)
        except Exception:
            pass

    # Leave From and To fields blank - they are for manual entry on printed form

    # Place reason (multi-line, word-wrapped)
    pos = FIELD_POSITIONS.get("reason", {})
    reason_x = pos.get("x", 470)
    reason_y = pos.get("y", 258)
    max_width = 200  # Max pixels per line
    words = str(reason).split()
    lines = []
    current_line = ""
    for word in words:
        test_line = current_line + (" " if current_line else "") + word
        if draw.textbbox((0, 0), test_line, font=font_text)[2] < max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)

    for i, line in enumerate(lines[:3]):  # Limit to 3 lines
        draw.text((reason_x, reason_y + i * 18), line,
                  fill="#1e40af", font=font_small)

    # Place signatures
    place_signature(template, draw, student_signature,
                    SIGNATURE_POSITIONS["student"]["x"],
                    SIGNATURE_POSITIONS["student"]["y"], font_small)
    place_signature(template, draw, parent_signature,
                    SIGNATURE_POSITIONS["parent"]["x"],
                    SIGNATURE_POSITIONS["parent"]["y"], font_small)

    # Placeholder for HOD and Mentor (to be filled later)
    draw.text((SIGNATURE_POSITIONS["hod"]["x"], SIGNATURE_POSITIONS["hod"]["y"]),
              "[HOD Signature Pending]", fill="#999999", font=font_small)
    draw.text((SIGNATURE_POSITIONS["mentor"]["x"], SIGNATURE_POSITIONS["mentor"]["y"]),
              "[Mentor Signature Pending]", fill="#999999", font=font_small)

    buffer = BytesIO()
    template.save(buffer, format="PNG")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"
