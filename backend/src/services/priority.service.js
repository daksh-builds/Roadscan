export function calculatePriority(severity, confidence) {
  let score = 0;

  if (severity >= 8) {
    score += 60;
  } else if (severity >= 5) {
    score += 35;
  } else {
    score += 15;
  }

  score += confidence * 40;

  score = Math.round(score);

  let priority;

  if (score >= 80) {
    priority = "Urgent";
  } else if (score >= 50) {
    priority = "High";
  } else if (score >= 30) {
    priority = "Medium";
  } else {
    priority = "Low";
  }

  return {
    priority_score: score,
    priority
  };
}