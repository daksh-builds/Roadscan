from fastapi import FastAPI, UploadFile, File
import shutil
import os

from .detector import detect

app = FastAPI(title="RoadScan AI Service")

UPLOAD_DIR = "ai_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/health")
def health():
    return {
        "success": True,
        "service": "RoadScan AI",
        "status": "running"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    detections = detect(file_path)

    return {
        "success": True,
        "detections": detections
    }