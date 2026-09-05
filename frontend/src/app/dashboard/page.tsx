"use client";
import dynamic from "next/dynamic";
import { getRepairStats} from "../../lib/api";
const RoadMap = dynamic(
  () => import("../../components/RoadMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400">
        Loading map...
      </div>
    ),
  }
);

import {
  useEffect,
  useState,
  ChangeEvent,
} from "react";

import Link from "next/link";

import {
  getRoads,
  getInspections,
  getDefects,
  uploadImage,
  createInspection,
  getImageUrl,
} from "../../lib/api";

type Road = {
  id: number;
  name: string;
  road_type?: string;
  latitude?: number;
  longitude?: number;
};

type Inspection = {
  id: number;
  road_id: number;
  road_name?: string;
  image_path: string;
  latitude?: number;
  longitude?: number;
  status: string;
  created_at: string;
};

type Defect = {
  id: number;
  inspection_id: number;
  defect_type: string;
  confidence: number;
  severity: number;
  priority_score: number;
  status: string;
  road_name?: string;
};

export default function Dashboard() {
  const [roads, setRoads] = useState<Road[]>([]);
  const [inspections, setInspections] = useState<
    Inspection[]
  >([]);
  const [defects, setDefects] = useState<Defect[]>([]);

  const [selectedRoad, setSelectedRoad] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [locationStatus, setLocationStatus] =
    useState("Location not detected");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const [
        roadsData,
        inspectionsData,
        defectsData,
      ] = await Promise.all([
        getRoads(),
        getInspections(),
        getDefects(),
      ]);

      setRoads(roadsData.roads || []);
      setInspections(
        inspectionsData.inspections || []
      );
      setDefects(defectsData.defects || []);
    } catch (err) {
      console.error(err);

      setError(
        "Failed to load dashboard data. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setSuccess(null);
    setError(null);

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);
  }

  function getLocation() {
    setLocationStatus("Getting your location...");

    if (!navigator.geolocation) {
      setLocationStatus(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        setLocationStatus(
          `Location detected: ${lat.toFixed(
            5
          )}, ${lng.toFixed(5)}`
        );
      },
      (geoError) => {
        console.error(geoError);

        setLocationStatus(
          "Unable to get location. Please allow location access."
        );

        setLatitude(null);
        setLongitude(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  async function handleCreateInspection() {
    if (!selectedFile) {
      setError("Please select a road image first.");
      return;
    }

    if (!selectedRoad) {
      setError("Please select a road.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      // 1. Upload image
      const uploadResult =
        await uploadImage(selectedFile);

      const imagePath =
        uploadResult.image_path;

      if (!imagePath) {
        throw new Error(
          "Backend did not return image path."
        );
      }

      // 2. Create inspection
      const inspectionResult =
        await createInspection({
          road_id: Number(selectedRoad),
          image_path: imagePath,
          latitude,
          longitude,
        });

      const inspectionId =
        inspectionResult.inspection?.id;

      setSuccess(
        inspectionId
          ? `Inspection #${inspectionId} created successfully. AI detection completed.`
          : "Inspection created successfully."
      );

      // Reset form
      setSelectedFile(null);
      setPreview(null);

      const fileInput =
        document.getElementById(
          "road-image"
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      // Refresh dashboard
      await loadDashboard();

      // Open details page
      if (inspectionId) {
        window.location.href =
          `/dashboard/${inspectionId}`;
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create inspection."
      );
    } finally {
      setUploading(false);
    }
  }

  const totalInspections =
    inspections.length;

  const totalDefects =
    defects.length;

  const urgentDefects =
    defects.filter(
      (defect) =>
        Number(defect.priority_score) >= 80
    ).length;

  const highDefects =
    defects.filter(
      (defect) =>
        Number(defect.priority_score) >= 50 &&
        Number(defect.priority_score) < 80
    ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Loading ROADSCAN dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-sm font-medium text-blue-400">
              ROADSCAN
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Road Inspection Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              AI-powered road defect detection
              and maintenance prioritization.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Refresh Data
          </button>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* Statistics */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Roads"
            value={roads.length}
          />

          <StatCard
            title="Inspections"
            value={totalInspections}
          />

          <StatCard
            title="Defects Detected"
            value={totalDefects}
          />

          <StatCard
            title="Urgent Defects"
            value={urgentDefects}
          />

        </section>

        {/* Create Inspection */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div>
            <p className="text-sm font-medium text-blue-400">
              NEW INSPECTION
            </p>

            <h2 className="mt-1 text-2xl font-semibold">
              Inspect a Road
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Upload a road image and ROADSCAN
              will automatically detect defects.
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            {/* Form */}
            <div className="space-y-5">

              {/* Road */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Select Road
                </label>

                <select
                  value={selectedRoad}
                  onChange={(event) =>
                    setSelectedRoad(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select a road
                  </option>

                  {roads.map((road) => (
                    <option
                      key={road.id}
                      value={road.id}
                    >
                      {road.name}
                    </option>
                  ))}
                </select>

                {roads.length === 0 && (
                  <p className="mt-2 text-xs text-yellow-400">
                    No roads found. Create a road
                    through the Roads API first.
                  </p>
                )}
              </div>

              {/* Image */}
              <div>
                <label
                  htmlFor="road-image"
                  className="mb-2 block text-sm font-medium"
                >
                  Road Image
                </label>

                <input
                  id="road-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Maximum file size: 10 MB
                </p>
              </div>

              {/* Location */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <p className="text-sm font-medium">
                      Inspection Location
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      GPS location will be attached
                      automatically.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={getLocation}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium hover:bg-blue-500"
                  >
                    Get Location
                  </button>

                </div>

                <div className="mt-3 text-xs">
                  {locationStatus}
                </div>

                {latitude !== null &&
                  longitude !== null && (
                    <div className="mt-3 grid grid-cols-2 gap-3">

                      <div className="rounded-lg border border-slate-800 p-3">
                        <p className="text-slate-500">
                          Latitude
                        </p>

                        <p className="mt-1 font-medium">
                          {latitude.toFixed(6)}
                        </p>
                      </div>

                      <div className="rounded-lg border border-slate-800 p-3">
                        <p className="text-slate-500">
                          Longitude
                        </p>

                        <p className="mt-1 font-medium">
                          {longitude.toFixed(6)}
                        </p>
                      </div>

                    </div>
                  )}

              </div>

              {/* Submit */}
              <button
                type="button"
                disabled={
                  uploading ||
                  !selectedFile ||
                  !selectedRoad
                }
                onClick={handleCreateInspection}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {uploading
                  ? "Uploading & Running AI..."
                  : "Start AI Inspection"}
              </button>

            </div>

            {/* Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <p className="mb-3 text-sm font-medium">
                Image Preview
              </p>

              {preview ? (
                <img
                  src={preview}
                  alt="Road preview"
                  className="h-full max-h-[400px] w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-700 text-sm text-slate-500">
                  Select a road image to preview
                </div>
              )}

            </div>

          </div>

        </section>

        {/* Defect Summary */}
        <section className="mt-8 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Urgent
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {urgentDefects}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Priority score ≥ 80
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              High Priority
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-400">
              {highDefects}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Priority score 50–79
            </p>

          </div>

        </section>

        {/* Road & Defect Map */}
        <section className="mt-8">

          <div className="mb-5">
            <h2 className="text-2xl font-semibold">
              Road & Defect Map
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              View inspected roads and detected
              defects using GPS coordinates.
            </p>
          </div>

          <RoadMap
            roads={roads}
            defects={defects}
          />

        </section>

        {/* Inspection History */}
        <section className="mt-8">

          <div className="mb-5">

            <h2 className="text-2xl font-semibold">
              Inspection History
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Recent ROADSCAN inspections.
            </p>

          </div>

          {inspections.length === 0 ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No inspections yet.
            </div>

          ) : (

            <div className="overflow-hidden rounded-2xl border border-slate-800">

              <div className="overflow-x-auto">

                <table className="w-full text-left text-sm">

                  <thead className="bg-slate-900 text-slate-400">

                    <tr>
                      <th className="px-5 py-4">
                        Inspection
                      </th>

                      <th className="px-5 py-4">
                        Road
                      </th>

                      <th className="px-5 py-4">
                        Status
                      </th>

                      <th className="px-5 py-4">
                        Location
                      </th>

                      <th className="px-5 py-4">
                        Date
                      </th>

                      <th className="px-5 py-4">
                        Action
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {inspections.map(
                      (inspection) => (
                        <tr
                          key={inspection.id}
                          className="border-t border-slate-800 bg-slate-950"
                        >

                          <td className="px-5 py-4 font-medium">
                            #{inspection.id}
                          </td>

                          <td className="px-5 py-4">
                            {inspection.road_name ||
                              "Unknown Road"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${inspection.status === "completed"
                                  ? "bg-green-500/10 text-green-400"
                                  : inspection.status === "pending"
                                    ? "bg-yellow-500/10 text-yellow-400"
                                    : "bg-red-500/10 text-red-400"
                                }`}
                            >
                              {inspection.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-400">

                            {inspection.latitude !==
                              undefined &&
                              inspection.longitude !==
                              undefined
                              ? `${Number(
                                inspection.latitude
                              ).toFixed(
                                4
                              )}, ${Number(
                                inspection.longitude
                              ).toFixed(4)}`
                              : "Not available"}

                          </td>

                          <td className="px-5 py-4 text-xs text-slate-400">
                            {new Date(
                              inspection.created_at
                            ).toLocaleString()}
                          </td>

                          <td className="px-5 py-4">

                            <Link
                              href={`/dashboard/${inspection.id}`}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              View Details →
                            </Link>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </section>

        {/* Recent Defects */}
        <section className="mt-8 pb-12">

          <div className="mb-5">

            <h2 className="text-2xl font-semibold">
              Recent Defects
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              AI detected road defects.
            </p>

          </div>

          {defects.length === 0 ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No defects detected yet.
            </div>

          ) : (

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

              {defects
                .slice(0, 6)
                .map((defect) => {

                  const score =
                    Number(
                      defect.priority_score
                    );

                  const priority =
                    score >= 80
                      ? "Urgent"
                      : score >= 50
                        ? "High"
                        : "Medium";

                  return (
                    <Link
                      key={defect.id}
                      href={`/dashboard/${defect.inspection_id}`}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
                    >

                      <div className="flex items-start justify-between">

                        <div>
                          <p className="font-semibold">
                            {defect.defect_type}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Defect #{defect.id}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${score >= 80
                              ? "bg-red-500/10 text-red-400"
                              : score >= 50
                                ? "bg-orange-500/10 text-orange-400"
                                : "bg-yellow-500/10 text-yellow-400"
                            }`}
                        >
                          {priority}
                        </span>

                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">

                        <Metric
                          label="Confidence"
                          value={`${(
                            Number(
                              defect.confidence
                            ) * 100
                          ).toFixed(1)}%`}
                        />

                        <Metric
                          label="Severity"
                          value={`${defect.severity}/10`}
                        />

                        <Metric
                          label="Priority"
                          value={`${score}/100`}
                        />

                        <Metric
                          label="Status"
                          value={defect.status}
                        />

                      </div>

                    </Link>
                  );
                })}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 p-3">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>

    </div>
  );
}