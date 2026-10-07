AI-powered road inspection and maintenance platform that detects road defects from images, calculates severity and priority, and helps track inspections and repairs.

Features
AI-based road defect detection using YOLO
Detects potholes and different types of road cracks
Bounding-box visualization for detected defects
Automatic severity scoring
Priority scoring: Urgent, High, Medium, Low
GPS-based road inspections
OpenStreetMap nearby-road detection
Defect and road visualization on maps
Inspection history
Repair assignment and tracking
Tech Stack

Frontend

Next.js
TypeScript
Tailwind CSS

Backend

Node.js
Express.js
PostgreSQL

AI

Python
FastAPI
Ultralytics YOLO

Mapping

OpenStreetMap
OpenStreetMap Overpass API
Browser Geolocation API
Architecture
User
 │
 ▼
Next.js Frontend
 │
 ▼
Express.js Backend
 │
 ├── PostgreSQL
 │
 └── FastAPI AI Service
        │
        ▼
      YOLO Model
        │
        ▼
   Defect Detection
        │
        ▼
 Severity + Priority
        │
        ▼
    PostgreSQL
Project Structure
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
How It Works
Upload Road Image
       ↓
AI Detection
       ↓
Detect Defects
       ↓
Calculate Severity
       ↓
Calculate Priority
       ↓
Save to PostgreSQL
       ↓
Display on Dashboard + Map
       ↓
Assign & Track Repairs
Run Locally
1. Frontend
cd frontend
npm install
npm run dev

Runs on:

http://localhost:3000
2. Backend
cd backend
npm install
npm start

Runs on:

http://localhost:5000
3. AI Service
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

Runs on:

http://localhost:8000
Environment Variables
Backend
PORT=5000
DATABASE_URL=your_postgresql_connection_string
AI_SERVICE_URL=http://localhost:8000
Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
AI Model

ROADSCAN uses a custom-trained YOLO model for detecting:

Potholes
Alligator cracks
Longitudinal cracks
Transverse cracks

The detected defects are used to calculate severity and priority before being stored in the database.

Deployment

The project can be deployed as three services:

Frontend → Vercel
Backend  → Render
AI       → Render
Database → PostgreSQL / Neon

For local development, all services can also run directly on the machine.

License

This project was developed as a hackathon project.
