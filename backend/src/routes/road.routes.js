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


router.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    // Search area: approximately 2 km around user's location
    const delta = 0.02;

    const minLat = lat - delta;
    const maxLat = lat + delta;
    const minLon = lon - delta;
    const maxLon = lon + delta;

    const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;

    const osmUrl =
      `https://api.openstreetmap.org/api/0.6/map?bbox=${bbox}`;

    console.log("Fetching roads from OpenStreetMap:", osmUrl);

    const response = await fetch(osmUrl, {
      headers: {
        "User-Agent": "ROADSCAN/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OpenStreetMap API failed: ${response.status}`
      );
    }

    const xml = await response.text();

    // Parse XML
    const { DOMParser } = await import("@xmldom/xmldom");

    const doc = new DOMParser().parseFromString(xml, "text/xml");

    // -----------------------------
    // Parse nodes
    // -----------------------------

    const nodes = new Map();

    const nodeElements = doc.getElementsByTagName("node");

    for (let i = 0; i < nodeElements.length; i++) {
      const node = nodeElements[i];

      const id = node.getAttribute("id");
      const latitude = Number(node.getAttribute("lat"));
      const longitude = Number(node.getAttribute("lon"));

      if (id) {
        nodes.set(id, {
          latitude,
          longitude,
        });
      }
    }

    // -----------------------------
    // Parse roads (ways)
    // -----------------------------

    const wayElements = doc.getElementsByTagName("way");

    const roads = [];

    const allowedHighways = new Set([
      "motorway",
      "trunk",
      "primary",
      "secondary",
      "tertiary",
      "unclassified",
      "residential",
      "living_street",
      "service",
    ]);

    for (let i = 0; i < wayElements.length; i++) {
      const way = wayElements[i];

      const tags = {};
      const tagElements = way.getElementsByTagName("tag");

      for (let j = 0; j < tagElements.length; j++) {
        const tag = tagElements[j];

        const key = tag.getAttribute("k");
        const value = tag.getAttribute("v");

        if (key) {
          tags[key] = value;
        }
      }

      // Only roads
      if (!allowedHighways.has(tags.highway)) {
        continue;
      }

      // Get road geometry
      const ndElements = way.getElementsByTagName("nd");

      const geometry = [];

      for (let j = 0; j < ndElements.length; j++) {
        const ref = ndElements[j].getAttribute("ref");

        const node = nodes.get(ref);

        if (node) {
          geometry.push(node);
        }
      }

      if (geometry.length < 2) {
        continue;
      }

      roads.push({
        osm_id: Number(way.getAttribute("id")),
        name: tags.name || "Unnamed Road",
        road_type: tags.highway,
        geometry,
      });
    }

    console.log(`Found ${roads.length} OSM roads`);

    res.json({
      success: true,
      latitude: lat,
      longitude: lon,
      roads,
    });
  } catch (error) {
    console.error("Nearby roads error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby roads",
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

router.post("/from-osm", async (req, res) => {
  try {
    const {
      osm_id,
      name,
      road_type,
      latitude,
      longitude,
    } = req.body;

    if (!osm_id || !name) {
      return res.status(400).json({
        success: false,
        message: "osm_id and name are required",
      });
    }

    // Check if this OSM road was already stored.
    // We store osm_id in road_type metadata for now
    // without changing the database schema.
    const existing = await pool.query(
      `
      SELECT *
      FROM roads
      WHERE name = $1
      LIMIT 1
      `,
      [name]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        road: existing.rows[0],
        existing: true,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO roads
      (
        name,
        road_type,
        latitude,
        longitude
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name,
        road_type || "osm",
        latitude || null,
        longitude || null,
      ]
    );

    res.status(201).json({
      success: true,
      road: result.rows[0],
      existing: false,
    });
  } catch (error) {
    console.error("Error saving OSM road:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save road",
    });
  }
});


export default router;