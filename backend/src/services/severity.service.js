export function calculateSeverity(defect) {
  const { defect_type, confidence, area } = defect;

  let score = 0;

  if (defect_type === "Pothole") {
    score += 40;
  } else if (
    defect_type === "Alligator crack" ||
    defect_type === "Longitudinal crack"
  ) {
    score += 30;
  } else if (defect_type === "Transverse crack") {
    score += 25;
  }

  score += confidence * 30;

  if (area >= 5000) {
    score += 30;
  } else if (area >= 2500) {
    score += 20;
  } else if (area >= 1000) {
    score += 10;
  }

  // Convert 0-100 score into 1-10 severity
  let severity = Math.ceil(score / 10);

  // Keep within database constraint 1-10
  severity = Math.max(1, Math.min(10, severity));

  return severity;
}