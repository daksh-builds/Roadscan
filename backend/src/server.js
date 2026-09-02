import express from "express";
import cors from "cors";
import "dotenv/config";
import pool from "./db.js";
import roadRoutes from "./routes/road.routes.js";
import inspectionRoutes from "./routes/inspection.routes.js";
import defectRoutes from "./routes/defect.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/roads", roadRoutes);

app.use("/api/inspections", inspectionRoutes);

app.use("/api/defects", defectRoutes);

app.use("/api/upload", uploadRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "RoadScan backend is running",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`RoadScan backend running on http://localhost:${PORT}`);
});