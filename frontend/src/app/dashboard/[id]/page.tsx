"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

import {
  getInspections,
  getInspectionDefects,
  getImageUrl,
  getDefectRepairs,
  createRepair,
  updateRepair,
} from "../../../lib/api";

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
  image_path?: string;
  latitude?: number;
  longitude?: number;
};

type Repair = {
  id: number;
  defect_id: number;
  assigned_to?: string;
  status: string;
  notes?: string;
  started_at?: string;
  completed_at?: string;
};

export default function InspectionDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [inspection, setInspection] =
    useState<Inspection | null>(null);

  const [defects, setDefects] = useState<Defect[]>([]);
  const [repairs, setRepairs] =
    useState<Record<number, Repair[]>>({});

  const [loading, setLoading] = useState(true);
  const [repairLoading, setRepairLoading] =
    useState<number | null>(null);

  const [repairForms, setRepairForms] = useState<
    Record<
      number,
      {
        assigned_to: string;
        status: string;
        notes: string;
      }
    >
  >({});

  useEffect(() => {
    async function loadData() {
      try {
        const inspectionId = Number(id);

        if (!Number.isInteger(inspectionId)) {
          throw new Error("Invalid inspection ID");
        }

        const [inspectionData, defectData] =
          await Promise.all([
            getInspections(),
            getInspectionDefects(inspectionId),
          ]);

        const foundInspection =
          (inspectionData.inspections || []).find(
            (item: Inspection) =>
              item.id === inspectionId
          );

        const loadedDefects =
          defectData.defects || [];

        setInspection(foundInspection || null);
        setDefects(loadedDefects);

        // Load repairs for every defect
        const repairResults = await Promise.all(
          loadedDefects.map(async (defect: Defect) => {
            try {
              const result =
                await getDefectRepairs(defect.id);

              return {
                defectId: defect.id,
                repairs: result.repairs || [],
              };
            } catch (error) {
              console.error(
                `Failed to load repairs for defect ${defect.id}`,
                error
              );

              return {
                defectId: defect.id,
                repairs: [],
              };
            }
          })
        );

        const repairMap: Record<number, Repair[]> = {};

        repairResults.forEach((item) => {
          repairMap[item.defectId] = item.repairs;
        });

        setRepairs(repairMap);

        // Initialize forms
        const forms: Record<
          number,
          {
            assigned_to: string;
            status: string;
            notes: string;
          }
        > = {};

        loadedDefects.forEach((defect: Defect) => {
          const existingRepair =
            repairMap[defect.id]?.[0];

          forms[defect.id] = {
            assigned_to:
              existingRepair?.assigned_to || "",
            status:
              existingRepair?.status || "assigned",
            notes:
              existingRepair?.notes || "",
          };
        });

        setRepairForms(forms);
      } catch (error) {
        console.error(
          "Error loading inspection:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function updateForm(
    defectId: number,
    field: "assigned_to" | "status" | "notes",
    value: string
  ) {
    setRepairForms((prev) => ({
      ...prev,
      [defectId]: {
        ...prev[defectId],
        [field]: value,
      },
    }));
  }

 async function handleRepairSubmit(defectId: number) {
  try {
    setRepairLoading(defectId);

    const form = repairForms[defectId];

    if (!form) return;

    const existingRepair = repairs[defectId]?.[0];

    if (existingRepair) {
      // UPDATE existing repair
      const result = await updateRepair(
        existingRepair.id,
        {
          assigned_to: form.assigned_to,
          status: form.status,
          notes: form.notes,
        }
      );

      setRepairs((prev) => ({
        ...prev,
        [defectId]: [
          result.repair || result,
        ],
      }));

      alert("Repair updated successfully");
    } else {
      // CREATE new repair
      const result = await createRepair({
        defect_id: defectId,
        assigned_to: form.assigned_to,
        notes: form.notes,
      });

      setRepairs((prev) => ({
        ...prev,
        [defectId]: [
          result.repair || result,
        ],
      }));

      alert("Repair assigned successfully");
    }
  } catch (error) {
    console.error(
      "Repair operation failed:",
      error
    );

    alert("Failed to save repair");
  } finally {
    setRepairLoading(null);
  }
}
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Loading inspection...
      </main>
    );
  }

  if (!inspection) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p>Inspection not found.</p>

        <Link
          href="/dashboard"
          className="mt-4 inline-block text-blue-400"
        >
          ← Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">

        <Link
          href="/dashboard"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <p className="text-sm text-blue-400">
            ROADSCAN INSPECTION
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Inspection #{inspection.id}
          </h1>

          <p className="mt-2 text-slate-400">
            {inspection.road_name || "Unknown Road"}
          </p>
        </div>

        {/* Inspection Information */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          {/* Road Image */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <h2 className="mb-4 text-lg font-semibold">
              Road Image
            </h2>

            <img
              src={getImageUrl(
                inspection.image_path
              )}
              alt="Inspected road"
              className="w-full rounded-xl object-cover"
            />

          </div>

          {/* Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <h2 className="mb-5 text-lg font-semibold">
              Inspection Information
            </h2>

            <div className="space-y-4">

              <Info
                label="Road"
                value={
                  inspection.road_name ||
                  "Unknown"
                }
              />

              <Info
                label="Status"
                value={inspection.status}
              />

              <Info
                label="Location"
                value={
                  inspection.latitude !== undefined &&
                  inspection.longitude !== undefined
                    ? `${inspection.latitude}, ${inspection.longitude}`
                    : "Not provided"
                }
              />

              <Info
                label="Date"
                value={new Date(
                  inspection.created_at
                ).toLocaleString()}
              />

              <Info
                label="Defects Detected"
                value={String(defects.length)}
              />

            </div>

          </div>
        </div>

        {/* Detected Defects */}
        <section className="mt-8">

          <div className="mb-5">
            <h2 className="text-2xl font-semibold">
              Detected Defects
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              AI detected {defects.length} road defect
              {defects.length !== 1 ? "s" : ""}.
            </p>
          </div>

          {defects.length === 0 ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No defects detected.
            </div>

          ) : (

            <div className="space-y-6">

              {defects.map((defect) => {

                const priorityScore =
                  Number(defect.priority_score);

                const priority =
                  priorityScore >= 80
                    ? "Urgent"
                    : priorityScore >= 50
                    ? "High"
                    : "Medium";

                const existingRepair =
                  repairs[defect.id]?.[0];

                const form =
                  repairForms[defect.id] || {
                    assigned_to: "",
                    status: "assigned",
                    notes: "",
                  };

                return (
                  <div
                    key={defect.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >

                    {/* Defect Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                      <div>
                        <p className="text-xl font-semibold">
                          {defect.defect_type}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Defect #{defect.id}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs ${
                          priorityScore >= 80
                            ? "bg-red-500/10 text-red-400"
                            : priorityScore >= 50
                            ? "bg-orange-500/10 text-orange-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {priority}
                      </span>

                    </div>

                    {/* Defect Stats */}
                    <div className="mt-6 grid gap-4 md:grid-cols-4">

                      <Info
                        label="Confidence"
                        value={`${(
                          Number(
                            defect.confidence
                          ) * 100
                        ).toFixed(1)}%`}
                      />

                      <Info
                        label="Severity"
                        value={`${defect.severity}/10`}
                      />

                      <Info
                        label="Priority Score"
                        value={`${defect.priority_score}/100`}
                      />

                      <Info
                        label="Status"
                        value={defect.status}
                      />

                    </div>

                    {/* Repair Management */}
                    <div className="mt-6 border-t border-slate-800 pt-6">

                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Repair Management
                          </h3>

                          <p className="text-sm text-slate-400">
                            Assign and track repair work.
                          </p>
                        </div>

                        {existingRepair && (
                          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                            Repair Assigned
                          </span>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">

                        {/* Assigned To */}
                        <div>
                          <label className="mb-2 block text-sm text-slate-400">
                            Assigned To
                          </label>

                          <input
                            type="text"
                            value={form.assigned_to}
                            onChange={(e) =>
                              updateForm(
                                defect.id,
                                "assigned_to",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Road Maintenance Team"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Status */}
                        <div>
                          <label className="mb-2 block text-sm text-slate-400">
                            Repair Status
                          </label>

                          <select
                            value={form.status}
                            onChange={(e) =>
                              updateForm(
                                defect.id,
                                "status",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                          >
                            <option value="assigned">
                              Assigned
                            </option>

                            <option value="in_progress">
                              In Progress
                            </option>

                            <option value="completed">
                              Completed
                            </option>
                          </select>
                        </div>

                      </div>

                      {/* Notes */}
                      <div className="mt-4">

                        <label className="mb-2 block text-sm text-slate-400">
                          Repair Notes
                        </label>

                        <textarea
                          value={form.notes}
                          onChange={(e) =>
                            updateForm(
                              defect.id,
                              "notes",
                              e.target.value
                            )
                          }
                          placeholder="Add repair instructions or notes..."
                          rows={3}
                          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                        />

                      </div>

                      {/* Save Button */}
                      <div className="mt-4 flex justify-end">

                        <button
                          onClick={() =>
                            handleRepairSubmit(
                              defect.id
                            )
                          }
                          disabled={
                            repairLoading ===
                            defect.id
                          }
                          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {repairLoading ===
                          defect.id
                            ? "Saving..."
                            : existingRepair
                            ? "Update Repair"
                            : "Assign Repair"}
                        </button>

                      </div>

                      {/* Existing Repair Info */}
                      {existingRepair && (
                        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">

                          <p className="text-sm font-medium">
                            Current Repair
                          </p>

                          <div className="mt-3 grid gap-3 md:grid-cols-3">

                            <Info
                              label="Assigned To"
                              value={
                                existingRepair.assigned_to ||
                                "Not assigned"
                              }
                            />

                            <Info
                              label="Status"
                              value={
                                existingRepair.status
                              }
                            />

                            <Info
                              label="Notes"
                              value={
                                existingRepair.notes ||
                                "No notes"
                              }
                            />

                          </div>

                        </div>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-medium">
        {value}
      </span>

    </div>
  );
}