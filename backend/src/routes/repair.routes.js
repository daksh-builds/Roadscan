import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /api/repairs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        rr.*,
        d.defect_type,
        d.severity,
        d.priority_score,
        d.confidence,
        i.image_path,
        i.road_id,
        r.name AS road_name
      FROM repair_records rr
      JOIN defects d
        ON rr.defect_id = d.id
      JOIN inspections i
        ON d.inspection_id = i.id
      LEFT JOIN roads r
        ON i.road_id = r.id
      ORDER BY rr.created_at DESC
    `);

    res.json({
      success: true,
      repairs: result.rows,
    });
  } catch (error) {
    console.error("Error fetching repairs:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch repairs",
    });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_repairs,
        COUNT(*) FILTER (
          WHERE status = 'assigned'
        ) AS assigned_repairs,
        COUNT(*) FILTER (
          WHERE status = 'in_progress'
        ) AS in_progress_repairs,
        COUNT(*) FILTER (
          WHERE status = 'completed'
        ) AS completed_repairs
      FROM repair_records
    `);

    res.json({
      success: true,
      stats: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching repair stats:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch repair stats",
    });
  }
});

// GET /api/repairs/defect/:defectId
router.get("/defect/:defectId", async (req, res) => {
  try {
    const { defectId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM repair_records
      WHERE defect_id = $1
      ORDER BY created_at DESC
      `,
      [defectId]
    );

    res.json({
      success: true,
      repairs: result.rows,
    });
  } catch (error) {
    console.error("Error fetching defect repairs:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch defect repairs",
    });
  }
});


// POST /api/repairs
router.post("/", async (req, res) => {
  try {
    const {
      defect_id,
      assigned_to,
      notes,
    } = req.body;

    if (!defect_id) {
      return res.status(400).json({
        success: false,
        message: "Defect ID is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO repair_records
      (
        defect_id,
        assigned_to,
        status,
        notes
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        defect_id,
        assigned_to || null,
        "assigned",
        notes || null,
      ]
    );

    res.status(201).json({
      success: true,
      repair: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating repair:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create repair",
    });
  }
});


// PUT /api/repairs/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      assigned_to,
      status,
      notes,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE repair_records
      SET
        assigned_to = COALESCE($1, assigned_to),
        status = COALESCE($2, status),
        notes = COALESCE($3, notes),
        started_at =
          CASE
            WHEN $2 = 'in_progress'
              AND started_at IS NULL
            THEN CURRENT_TIMESTAMP
            ELSE started_at
          END,
        completed_at =
          CASE
            WHEN $2 = 'completed'
            THEN CURRENT_TIMESTAMP
            ELSE completed_at
          END
      WHERE id = $4
      RETURNING *
      `,
      [
        assigned_to || null,
        status || null,
        notes || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Repair record not found",
      });
    }

    res.json({
      success: true,
      repair: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating repair:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update repair",
    });
  }
});

export default router;