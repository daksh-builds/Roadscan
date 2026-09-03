"use client";

import { useState } from "react";
import { uploadInspection } from "../lib/api";

export default function Dashboard() {
  const [roadId, setRoadId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!roadId || !image) {
      alert("Select road and image");
      return;
    }

    try {
      setLoading(true);

      const data = await uploadInspection(
        Number(roadId),
        image
      );

      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">
        ROADSCAN Dashboard
      </h1>

      <div className="max-w-xl space-y-4">
        <input
          type="number"
          placeholder="Road ID"
          value={roadId}
          onChange={(e) => setRoadId(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(e.target.files?.[0] || null)
          }
          className="w-full border p-3 rounded"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="px-6 py-3 rounded bg-black text-white"
        >
          {loading ? "Analyzing..." : "Analyze Road"}
        </button>
      </div>

      {result && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">
            Detection Results
          </h2>

          <div className="space-y-4">
            {result.defects?.map(
              (defect: any, index: number) => (
                <div
                  key={index}
                  className="border rounded p-4"
                >
                  <p>
                    <b>Defect:</b>{" "}
                    {defect.defect_type}
                  </p>

                  <p>
                    <b>Confidence:</b>{" "}
                    {defect.confidence}
                  </p>

                  <p>
                    <b>Severity:</b>{" "}
                    {defect.severity}
                  </p>

                  <p>
                    <b>Priority:</b>{" "}
                    {defect.priority}
                  </p>

                  <p>
                    <b>Priority Score:</b>{" "}
                    {defect.priority_score}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </main>
  );
}