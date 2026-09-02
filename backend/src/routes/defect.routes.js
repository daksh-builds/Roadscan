import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/defects
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         d.*,
         i.image_path,
         r.name AS road_name
       FROM defects d
       JOIN inspections i ON d.inspection_id = i.id
       LEFT JOIN roads r ON i.road_id = r.id
       ORDER BY d.created_at DESC`
    );

    res.json({
      success: true,
      defects: result.rows,
    });
  } catch (error) {
    console.error("Error fetching defects:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch defects",
    });
  }
});

// POST /api/defects
router.post("/", async (req, res) => {
  try {
    const {
      inspection_id,
      defect_type,
      confidence,
      severity,
      priority_score,
      latitude,
      longitude,
    } = req.body;

    if (!inspection_id || !defect_type) {
      return res.status(400).json({
        success: false,
        message: "Inspection ID and defect type are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO defects
       (
         inspection_id,
         defect_type,
         confidence,
         severity,
         priority_score,
         latitude,
         longitude
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        inspection_id,
        defect_type,
        confidence || null,
        severity || null,
        priority_score || null,
        latitude || null,
        longitude || null,
      ]
    );

    res.status(201).json({
      success: true,
      defect: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating defect:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create defect",
    });
  }
});

export default router;