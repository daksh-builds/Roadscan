from ultralytics import YOLO

model = YOLO("best.pt")


def detect(image_path):
    results = model(image_path)

    detections = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            bbox = box.xyxy[0].tolist()
            x1, y1, x2, y2 = bbox

            area = (x2 - x1) * (y2 - y1)

            detections.append({
                "class_id": class_id,
                "defect_type": model.names[class_id],
                "confidence": round(confidence, 3),
                "bbox": [round(x, 2) for x in bbox],
                "area": round(area, 2)
            })

    return detections