

# 🚧 ROADSCAN

AI-powered road inspection and maintenance platform that detects road defects from images, calculates their severity and priority, and helps track inspections and repairs.

---

## ✨ Features

- 🤖 AI-based road defect detection using YOLO
- 🕳️ Detects potholes and different types of road cracks
- 📦 Bounding-box visualization for detected defects
- 📊 Automatic severity scoring
- 🚨 Priority scoring: Urgent, High, Medium, Low
- 📍 GPS-based road inspections
- 🗺️ OpenStreetMap nearby-road detection
- 📌 Defect and road visualization on maps
- 📋 Inspection history
- 🔧 Repair assignment and tracking

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- PostgreSQL

### AI

- Python
- FastAPI
- Ultralytics YOLO

### Mapping

- OpenStreetMap
- OpenStreetMap Overpass API
- Browser Geolocation API

---

## 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │      User       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Next.js Frontend│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Express Backend │
                    └──────┬─────┬────┘
                           │     │
                 ┌─────────┘     └─────────┐
                 ▼                         ▼
        ┌─────────────────┐       ┌─────────────────┐
        │   PostgreSQL    │       │  FastAPI + YOLO │
        └─────────────────┘       └────────┬────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │ Defect Detection │
                                  └────────┬────────┘
                                           │
                                           ▼
                                  Severity + Priority
📁 Project Structure
ROADSCAN/
│
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/
│
├── backend/
│   └── src/
│       ├── routes/
│       ├── services/
│       ├── db.js
│       └── server.js
│
├── ai-service/
│   ├── app/
│   │   ├── main.py
│   │   └── detector.py
│   ├── best.pt
│   └── requirements.txt
│
└── README.md
🔄 How It Works
Road Image
    │
    ▼
Upload Image
    │
    ▼
YOLO Defect Detection
    │
    ▼
Detect Potholes / Cracks
    │
    ▼
Calculate Severity
    │
    ▼
Calculate Priority
    │
    ▼
Store in PostgreSQL
    │
    ▼
Display on Dashboard & Map
    │
    ▼
Assign & Track Repairs
🚀 Run Locally
1. Frontend
cd frontend
npm install
npm run dev

Frontend:

http://localhost:3000
2. Backend
cd backend
npm install
npm start

Backend:

http://localhost:5000
3. AI Service
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

AI Service:

http://localhost:8000
🔐 Environment Variables
Backend
PORT=5000
DATABASE_URL=your_postgresql_connection_string
AI_SERVICE_URL=http://localhost:8000
Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
🤖 AI Model

ROADSCAN uses a custom-trained YOLO model to detect:

Potholes
Alligator cracks
Longitudinal cracks
Transverse cracks

Each detection provides:

Defect type
Confidence
Bounding box
Severity
Priority score

🌍 Deployment

The application can be deployed as separate services:

Service	Technology
Frontend	Vercel
Backend	Render
AI Service	Render
Database	PostgreSQL / Neon
📌 Project Goal

ROADSCAN aims to make road inspection faster and more data-driven by combining computer vision, GPS, mapping, and automated prioritization into a single platform.

📄 License

This project was developed as a hackathon project.
