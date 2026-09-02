import express from "express";
import pool from "../db.js";
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

    // 1. Save inspection in database
    const result = await pool.query(
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

    // 2. Convert URL path to actual filesystem path
    const actualImagePath = image_path.startsWith("/")
      ? image_path.slice(1)
      : image_path;

    // 3. Send image to AI service
    const aiResult = await detectDefects(actualImagePath);


    // 4. Return inspection + AI result
    res.status(201).json({
      success: true,
      inspection: result.rows[0],
      ai_result: aiResult,
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