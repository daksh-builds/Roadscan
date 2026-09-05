import express from "express";
import pool from "../db.js";

import { calculateSeverity } from "../services/severity.service.js";
import { calculatePriority } from "../services/priority.service.js";
import { detectDefects } from "../services/ai.service.js";

const router = express.Router();


// GET /api/inspections
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         i.*,
         r.name AS road_name
       FROM inspections i
       LEFT JOIN roads r ON i.road_id = r.id
       ORDER BY i.created_at DESC`
    );

    res.json({
      success: true,
      inspections: result.rows,
    });

  } catch (error) {
    console.error("Error fetching inspections:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inspections",
    });
  }
});


// POST /api/inspections
router.post("/", async (req, res) => {
  try {
    const {
      road_id,
      image_path,
      latitude,
      longitude,
    } = req.body;

    if (!image_path) {
      return res.status(400).json({
        success: false,
        message: "Image path is required",
      });
    }


    // 1. Create inspection
    const inspectionResult = await pool.query(
      `INSERT INTO inspections
       (road_id, image_path, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        road_id || null,
        image_path,
        latitude || null,
        longitude || null,
      ]
    );

    const inspection = inspectionResult.rows[0];


    // 2. Convert URL path to filesystem path
    const actualImagePath = image_path.startsWith("/")
      ? image_path.slice(1)
      : image_path;


    // 3. Send image to AI service
    const aiResult = await detectDefects(actualImagePath);


    // 4. Calculate severity + priority
    // 5. Save defects
    const savedDefects = [];

    for (const detection of aiResult.detections) {

      const severity = calculateSeverity(detection);

      const {
        priority_score,
        priority
      } = calculatePriority(
        severity,
        detection.confidence
      );


      const defectResult = await pool.query(
        `
        INSERT INTO defects
        (
          inspection_id,
          defect_type,
          confidence,
          severity,
          priority_score,
          latitude,
          longitude,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          inspection.id,
          detection.defect_type,
          detection.confidence,
          severity,
          priority_score,
          latitude || null,
          longitude || null,
          "detected",
        ]
      );


      savedDefects.push({
        ...defectResult.rows[0],
        bbox: detection.bbox,
        area: detection.area,
        priority,
      });
    }
await pool.query(
  `UPDATE inspections
   SET status = 'completed'
   WHERE id = $1`,
  [inspection.id]
);

inspection.status = "completed";

    // 6. Final response
    res.status(201).json({
      success: true,

      inspection,

      ai_result: {
        success: true,
        detections: aiResult.detections,
      },

      defects: savedDefects,
    });

 } catch (error) {
  console.error("Error creating inspection:", error);

  res.status(500).json({
    success: false,
    message: "Failed to create inspection",
  });
}
});


export default router;