# 🛡️ TRACE — Criminal Intelligence & 3D Spatial Knowledge Graph Platform

**TRACE** is an advanced AI-powered criminal intelligence, knowledge graph, and forensic decision-support system designed for law enforcement, special investigation teams (SIT), and intelligence agencies.

---

## 🏛️ System Architecture

* **Backend**: FastAPI (Python 3.10+), NetworkX graph analytics, SQLite (WAL mode persistence), Pydantic v2 schemas.
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, 3D Force-Directed WebGL Canvas, Cytoscape.js.
* **Intelligence Engines**:
  * **Police Solutions Engine**: Computes High-Value Target (HVT) priorities, statutory penal codes (BNS / NDPS / PMLA / IPC), articulation bottlenecks, and 72-hour raiding playbooks.
  * **Universal Multi-Modal ETL**: Ingests telecom CDR/IPDR CSVs, bank/SWIFT ledgers, ANPR toll scans, and police FIR/interrogation transcripts.
  * **Cross-Cartel Fusion**: Identifies transnational umbrella syndicates and bridge entities across isolated cases.
  * **AI Suspect Interrogation Simulator**: Simulates custodial suspect dialogue with dynamic biometric stress (BPM / deception probability).
  * **Judicial Charge Sheet & Warrant Generator**: Section 65B-compliant evidence dossiers with SHA-256 exhibit validation.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
* **Python**: 3.10 or higher
* **Node.js**: v18 or higher (npm v9+)
* **Git**

---

### 2. Backend Setup

`ash
# Navigate to the backend directory
cd apps/backend

# (Optional) Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install scipy

# Launch FastAPI backend server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
`

* Backend API runs at: **http://127.0.0.1:8000**
* Interactive Swagger Docs: **http://127.0.0.1:8000/docs**

---

### 3. Frontend Setup

`ash
# In a new terminal, navigate to the frontend directory
cd apps/frontend

# Install dependencies
npm install

# Start local development server
npm run dev
# OR build and run preview server
npm run build
npm run preview
`

* TRACE Web Console runs at: **http://localhost:3000** (or Vite dev port displayed in terminal)

---

## 🧪 Running Test Suites

TRACE includes 25+ exhaustive integration tests and 4 real-world landmark benchmarks:

`ash
# Run exhaustive REST API test suite (38+ endpoints)
python tests/test_exhaustive_endpoints.py

# Run real-life landmark benchmarks (26/11, PNB Scam, Mundra Port, Pulwama)
python tests/test_real_life_benchmarks.py

# Run complete case creation, ingestion & police solutions lifecycle test
python tests/test_new_case_lifecycle.py
`

---

## 📂 Repository Structure

`
Trace/
├── apps/
│   ├── backend/             # FastAPI REST service & Python reasoning engines
│   │   ├── app/
│   │   │   ├── api/         # REST router & endpoint definitions
│   │   │   ├── models/      # Pydantic v2 schemas
│   │   │   ├── repositories/# SQLite & NetworkX persistence
│   │   │   └── services/    # ETL, ML, Bayesian & Police Solutions engines
│   │   └── main.py          # FastAPI application entrypoint
│   └── frontend/            # React 18 + TypeScript + 3D WebGL HUD
│       ├── src/
│       │   ├── components/  # 3D Canvas, Police Solutions, Case Hub, Modals
│       │   ├── services/    # Unified API client & offline fallbacks
│       │   └── App.tsx      # Main application state & routing
│       └── package.json
├── data/                    # Synthetic benchmarks & ground truth datasets
├── docs/                    # Architectural guidelines & AI rules
└── tests/                   # Automated unit, integration & benchmark suites
`

---

## 🔒 Security & Evidence Compliance

* All exported legal exhibits include cryptographic **SHA-256 hashes** compliant with **Section 65B of the Indian Evidence Act**.
* Role-based multi-agency sanitization masks confidential informants (HUMINT) based on receiving agency clearance levels (TOP SECRET, SECRET, CONFIDENTIAL).

---

## 👥 Authors & License

Maintained by the TRACE Intelligence Development Team.
