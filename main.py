from datetime import datetime, timezone
import json
import os
import random

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI(title="CivicTriage API")

# Comma-separated list of allowed origins, configured per environment.
# Example: "https://your-app.vercel.app,http://localhost:3000"
_default_origins = "http://localhost:3000,http://127.0.0.1:3000"
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = joblib.load("civicfix_model.joblib")

# OLD (in-memory storage, replaced by Firestore below):
# db_complaints = []

COMPLAINTS_COLLECTION = "complaints"


# ---------------------------------------------------------------------------
# Storage layer
#
# In production we store complaints in Google Cloud Firestore so they survive
# server restarts. Credentials are supplied via the FIREBASE_CREDENTIALS
# environment variable (the full service-account JSON) so no secret ever lives
# in the repo. If Firestore is not configured (e.g. local development without
# credentials) we fall back to an in-memory list so the app still runs.
# ---------------------------------------------------------------------------

def _init_firestore():
    raw = os.getenv("FIREBASE_CREDENTIALS")
    if not raw:
        return None
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        cred = credentials.Certificate(json.loads(raw))
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        return firestore.client()
    except Exception as exc:  # pragma: no cover - startup diagnostics
        print(f"[WARN] Firestore not initialized, using in-memory store: {exc}")
        return None


_firestore = _init_firestore()
_memory_complaints = []


def store_complaint(complaint: dict) -> None:
    if _firestore is not None:
        _firestore.collection(COMPLAINTS_COLLECTION).add(complaint)
    else:
        _memory_complaints.append(complaint)


def list_complaints() -> list:
    if _firestore is not None:
        docs = _firestore.collection(COMPLAINTS_COLLECTION).stream()
        complaints = [doc.to_dict() for doc in docs]
        complaints.sort(key=lambda c: c.get("created_at", ""), reverse=True)
        return complaints
    return list(reversed(_memory_complaints))


def set_complaint_status(complaint_id: str, status: str):
    if _firestore is not None:
        query = (
            _firestore.collection(COMPLAINTS_COLLECTION)
            .where("id", "==", complaint_id)
            .limit(1)
            .stream()
        )
        for doc in query:
            doc.reference.update({"status": status})
            updated = doc.to_dict()
            updated["status"] = status
            return updated
        return None

    for complaint in _memory_complaints:
        if complaint.get("id") == complaint_id:
            complaint["status"] = status
            return complaint
    return None


def complaint_count() -> int:
    if _firestore is not None:
        return len(list(_firestore.collection(COMPLAINTS_COLLECTION).stream()))
    return len(_memory_complaints)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "CivicTriage API",
        "storage": "firestore" if _firestore is not None else "in-memory",
    }


class ComplaintInput(BaseModel):
    department: str
    description: str
    suburb: str
    ward: str
    latitude: float
    longitude: float


class ComplaintLogInput(BaseModel):
    department: str
    description: str
    suburb: str
    ward: str
    latitude: float
    longitude: float
    priority: str
    status: str = "New"
    location: str | None = None


class ComplaintStatusUpdate(BaseModel):
    status: str


@app.get("/api/complaints")
def get_complaints():
    # OLD (in-memory):
    #     return db_complaints
    return list_complaints()


@app.put("/api/complaints/{complaint_id}/status")
def update_complaint_status(complaint_id: str, payload: ComplaintStatusUpdate):
    allowed_statuses = {"New", "Assigned", "Resolved"}
    if payload.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status '{payload.status}'. Allowed values: {sorted(allowed_statuses)}")

    # OLD (in-memory):
    #     for complaint in db_complaints:
    #         if complaint.get("id") == complaint_id:
    #             complaint["status"] = payload.status
    #             return complaint
    #     raise HTTPException(status_code=404, detail=f"Complaint {complaint_id} not found")
    updated = set_complaint_status(complaint_id, payload.status)
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Complaint {complaint_id} not found")
    return updated


@app.post("/api/complaints")
def save_complaint(data: ComplaintLogInput):
    complaint_id = f"#C3-{random.randint(1000, 9999)}"
    complaint = {
        "id": complaint_id,
        "department": data.department,
        "description": data.description,
        "suburb": data.suburb,
        "ward": data.ward,
        "location": data.location or f"{data.suburb}, {data.ward}",
        "latitude": data.latitude,
        "longitude": data.longitude,
        "category": data.department,
        "priority": data.priority,
        "status": data.status,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    # OLD (in-memory):
    #     db_complaints.append(complaint)
    store_complaint(complaint)
    return {"message": f"Complaint {complaint_id} successfully logged to the queue.", "id": complaint_id}


@app.post("/api/triage")
def predict_urgency(data: ComplaintInput):
    try:
        fault_desc = f"{data.department} - {data.description}"
        input_df = pd.DataFrame([{
            "fault_description": fault_desc,
            "Suburb_Clean": data.suburb,
            "Ward": data.ward,
            "Latitude": data.latitude,
            "Longitude": data.longitude,
        }])

        probabilities = pipeline.predict_proba(input_df)[0]
        prob_critical = probabilities[1]

        if prob_critical >= 0.25:
            prediction = 1
            confidence = float(prob_critical * 100)
        else:
            prediction = 0
            confidence = float(probabilities[0] * 100)

        result = {
            "priority": "Critical" if prediction == 1 else "Routine",
            "confidence": round(confidence, 1),
            "explanation": "Immediate safety risk detected based on infrastructure failure keywords." if prediction == 1 else "Matches standard maintenance patterns.",
            "recommended_action": "Review immediately and follow emergency escalation." if prediction == 1 else "Assign to standard departmental queue.",
        }

        # OLD (in-memory): id was f"#C3-{len(db_complaints) + 1:04d}"
        complaint = {
            "id": f"#C3-{complaint_count() + 1:04d}",
            "description": data.description,
            "category": data.department,
            "location": f"{data.suburb}, {data.ward}",
            "ward": data.ward,
            "priority": result["priority"],
            "status": "New",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "confidence": result["confidence"],
            "recommended_action": result["recommended_action"],
            "explanation": result["explanation"],
        }
        # OLD (in-memory):
        #     db_complaints.append(complaint)
        store_complaint(complaint)

        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
