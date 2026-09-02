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


// POST /api/roads
router.post("/", async (req, res) => {
  try {
    const { name, road_type, latitude, longitude } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Road name is required",
      });
    }

    const result = await pool.query(
      `INSERT INTO roads (name, road_type, latitude, longitude)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, road_type || null, latitude || null, longitude || null]
    );

    res.status(201).json({
      success: true,
      road: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating road:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create road",
    });
  }
});



// GET /api/roads/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM roads WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found",
      });
    }

    res.json({
      success: true,
      road: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching road:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch road",
    });
  }
});

// PUT /api/roads/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, road_type, latitude, longitude } = req.body;

    const result = await pool.query(
      `UPDATE roads
       SET name = $1,
           road_type = $2,
           latitude = $3,
           longitude = $4
       WHERE id = $5
       RETURNING *`,
      [name, road_type, latitude, longitude, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found",
      });
    }

    res.json({
      success: true,
      road: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating road:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update road",
    });
  }
});


// DELETE /api/roads/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM roads WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Road not found",
      });
    }

    res.json({
      success: true,
      message: "Road deleted successfully",
      road: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting road:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete road",
    });
  }
});


export default router;