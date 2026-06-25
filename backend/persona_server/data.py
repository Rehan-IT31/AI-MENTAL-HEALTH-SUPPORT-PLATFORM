from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import json
import os
import tempfile
from datetime import datetime

# Firebase
from firebase_admin import credentials, firestore, initialize_app

# PDF (ReportLab ONLY — no WeasyPrint)
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4

# -----------------------------
# Firebase init
# -----------------------------
cred = credentials.Certificate("credentials.json")
initialize_app(cred)
db = firestore.client()

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Models
# -----------------------------
class PersonaRequest(BaseModel):
    user_id: str

# -----------------------------
# Helpers
# -----------------------------
def format_section(section_data, title, story, styles):
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"<b>{title}</b>", styles["Heading2"]))
    story.append(Spacer(1, 6))

    if isinstance(section_data, dict):
        for key, value in section_data.items():
            story.append(
                Paragraph(f"<b>{key}:</b> {value}", styles["Normal"])
            )
            story.append(Spacer(1, 4))
    elif isinstance(section_data, list):
        for item in section_data:
            story.append(Paragraph(f"- {item}", styles["Normal"]))
            story.append(Spacer(1, 4))
    else:
        story.append(Paragraph(str(section_data), styles["Normal"]))


# -----------------------------
# PDF Generator (SAFE)
# -----------------------------
def generate_persona_pdf(data: Dict[str, Any]) -> str:
    styles = getSampleStyleSheet()

    output_filename = os.path.join(
        tempfile.gettempdir(),
        f"persona_report_{datetime.utcnow().timestamp()}.pdf"
    )

    doc = SimpleDocTemplate(output_filename, pagesize=A4)
    story = []

    # Title
    story.append(Paragraph("Persona Assessment Report", styles["Title"]))
    story.append(Spacer(1, 15))

    info_data = data.get("info", {})

    if "demographics" in info_data:
        format_section(info_data["demographics"], "Demographics", story, styles)

    if "familyEmployment" in info_data:
        format_section(info_data["familyEmployment"], "Family & Employment Status", story, styles)

    if "therapyReasons" in info_data:
        format_section(info_data["therapyReasons"], "Therapy Goals & Reasons", story, styles)

    if "mentalHealthHistory" in info_data:
        format_section(info_data["mentalHealthHistory"], "Mental Health History", story, styles)

    if "traumaAndAdverseExperiences" in info_data:
        format_section(info_data["traumaAndAdverseExperiences"], "Trauma & Adverse Experiences", story, styles)

    if "substanceUse" in info_data:
        format_section(info_data["substanceUse"], "Substance Use", story, styles)

    if "healthAndLifestyle" in info_data:
        format_section(info_data["healthAndLifestyle"], "Health & Lifestyle", story, styles)

    if "medicalAndMedicationHistory" in info_data:
        format_section(info_data["medicalAndMedicationHistory"], "Medical & Medication History", story, styles)

    story.append(PageBreak())

    if "behavioralPatterns" in info_data:
        format_section(info_data["behavioralPatterns"], "Behavioral Patterns", story, styles)

    if "riskAssessment" in info_data:
        format_section(info_data["riskAssessment"], "Risk Assessment", story, styles)

    if "psychologicalFormulation" in info_data:
        format_section(info_data["psychologicalFormulation"], "Psychological Formulation", story, styles)

    if "strengthsAndResources" in info_data:
        format_section(info_data["strengthsAndResources"], "Strengths & Resources", story, styles)

    if "therapyRecommendations" in info_data:
        format_section(info_data["therapyRecommendations"], "Therapy Recommendations", story, styles)

    story.append(Spacer(1, 30))
    story.append(Paragraph("End of Report", styles["Normal"]))
    story.append(
        Paragraph(
            "<i>This report is generated from assessment data and should be reviewed by a qualified mental health professional.</i>",
            styles["Italic"],
        )
    )

    doc.build(story)
    return output_filename


# -----------------------------
# API Route
# -----------------------------
@app.post("/generate_persona")
def generate_persona(req: PersonaRequest):
    user_ref = db.collection("users").document(req.user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="USER_NOT_FOUND")

    user_data = user_doc.to_dict()

    if "personaData" not in user_data:
        raise HTTPException(status_code=400, detail="Persona data not found")

    pdf_path = generate_persona_pdf(user_data["personaData"])

    return {
        "status": "success",
        "pdf_path": pdf_path
    }
