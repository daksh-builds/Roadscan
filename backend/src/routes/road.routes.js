import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/roads
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM roads ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      roads: result.rows,
    });
  } catch (error) {
    console.error("Error fetching roads:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch roads",
    });
  }
});

export default router;