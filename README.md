# CivicFix Triage

CivicFix Triage is a municipal service-request triage and operations platform designed to help local government teams prioritize infrastructure issues, route complaints, and support faster decision-making using AI-assisted urgency scoring.

The system combines:

- A Python-based predictive triage model for estimating urgency
- A FastAPI service for complaint processing and triage logic
- A Streamlit interface for rapid manual assessment and prediction
- A Next.js operations dashboard for city service teams to review and manage cases

## Overview

The project is intended to support civic operations teams by transforming informal service reports into structured, actionable work items. It helps identify potentially high-risk issues, assign appropriate priorities, and provide a clear operational view of active and resolved complaints.

## Key Features

- AI-based urgency classification for civic complaints
- Complaint logging and status tracking
- Dashboard summaries for open, critical, assigned, and resolved cases
- Department and location-aware triage inputs
- Responsible-use guidance for all predictions to ensure human review remains in control

## Architecture

This repository contains three core components:

- `app.py` — Streamlit user interface for manual triage prediction
- `main.py` — FastAPI backend and complaint API
- `civic-triage/` — Next.js dashboard for queue management and operational review

## Repository Structure

```text
CivicFix_UI/
├── app.py                  # Streamlit triage interface
├── main.py                 # FastAPI API service
├── civicfix_model.joblib   # Trained triage model
├── AGENTS.md               # Agent guidance
├── README.md               # Project documentation
├── civic-triage/           # Front-end dashboard application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── ...
└── ...
```

## Prerequisites

Before running the project, make sure you have:

- Python 3.10 or later
- pip for Python package installation
- Node.js 18+ and npm
- A local environment capable of running a FastAPI backend and a Next.js application

## Getting Started

### 1. Install Python dependencies

Install the packages required by the model and API, including:

- `streamlit`
- `fastapi`
- `uvicorn`
- `joblib`
- `pandas`
- `scikit-learn` (if required by the model pipeline)

Example:

```bash
pip install streamlit fastapi uvicorn joblib pandas scikit-learn
```

### 2. Run the FastAPI backend

From the project root:

```bash
uvicorn main:app --reload
```

The API will be available at:

- `http://localhost:8000/`
- `http://localhost:8000/api/complaints`
- `http://localhost:8000/api/triage`

### 3. Run the Streamlit triage tool

From the project root:

```bash
streamlit run app.py
```

This launches the complaint triage interface where users can submit municipal issue details and obtain urgency predictions.

### 4. Run the dashboard frontend

From the `civic-triage` directory:

```bash
cd civic-triage
npm install
npm run dev
```

Then open the local dashboard in your browser at:

- `http://localhost:3000`

## API Overview

The backend exposes endpoints to support complaint intake and operational triage.

### Complaint endpoints

- `GET /api/complaints` — View all logged complaints
- `POST /api/complaints` — Create a new complaint entry
- `PUT /api/complaints/{complaint_id}/status` — Update complaint status
- `POST /api/triage` — Submit complaint details and receive urgency classification

## Model Behavior

The model uses complaint metadata such as:

- department or complaint type
- fault description
- suburb and ward information
- geographical coordinates

It predicts whether a case is likely to require immediate attention or follow normal maintenance procedures. Predictions are advisory and should be reviewed by a responsible officer before dispatch or final escalation.

## Responsible Use

This tool is designed to support operational decision-making, not replace professional judgment. Any final dispatch or response decision must remain under the authority of the relevant civic operations supervisor or service team.

## License

This project is intended for internal or demonstration use unless otherwise specified by the owning organization. Add a formal license file if you intend to distribute or reuse the code beyond internal project use.

## Contributing

Contributions are welcome when aligned with the project’s operational and civic integrity goals. For any significant changes, please review the code paths affecting model behavior, API logic, and dashboard workflows before deployment.
