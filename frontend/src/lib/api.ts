const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// =========================
// ROADS
// =========================

export async function getRoads() {
  const response = await fetch(`${API_URL}/api/roads`);

  if (!response.ok) {
    throw new Error("Failed to fetch roads");
  }

  return response.json();
}

export async function getNearbyRoads(
  latitude: number,
  longitude: number
) {
  const url =
    `${API_URL}/api/roads/nearby` +
    `?latitude=${encodeURIComponent(latitude)}` +
    `&longitude=${encodeURIComponent(longitude)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        `Failed to fetch nearby roads (${response.status})`
    );
  }

  return response.json();
}

export async function saveOSMRoad(road: {
  osm_id: number;
  name: string;
  road_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const response = await fetch(
    `${API_URL}/api/roads/from-osm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(road),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        `Failed to save OSM road (${response.status})`
    );
  }

  return response.json();
}

// =========================
// INSPECTIONS
// =========================

export async function getInspections() {
  const response = await fetch(
    `${API_URL}/api/inspections`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch inspections");
  }

  return response.json();
}

export async function getInspectionDefects(
  inspectionId: number
) {
  const response = await fetch(
    `${API_URL}/api/defects/inspection/${inspectionId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch inspection defects");
  }

  return response.json();
}

export async function createInspection(data: {
  road_id?: number;
  image_path: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const response = await fetch(
    `${API_URL}/api/inspections`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        "Failed to create inspection"
    );
  }

  return response.json();
}

// =========================
// DEFECTS
// =========================

export async function getDefects() {
  const response = await fetch(
    `${API_URL}/api/defects`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch defects");
  }

  return response.json();
}

// =========================
// IMAGE UPLOAD
// =========================

export async function uploadImage(file: File) {
  const formData = new FormData();

  formData.append("image", file);

  const response = await fetch(
    `${API_URL}/api/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        "Failed to upload image"
    );
  }

  return response.json();
}

export function getImageUrl(imagePath: string) {
  if (!imagePath) {
    return "";
  }

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  return `${API_URL}${imagePath}`;
}

// =========================
// REPAIRS
// =========================

export async function getRepairs() {
  const response = await fetch(
    `${API_URL}/api/repairs`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch repairs");
  }

  return response.json();
}

export async function getDefectRepairs(
  defectId: number
) {
  const response = await fetch(
    `${API_URL}/api/repairs/defect/${defectId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch defect repairs");
  }

  return response.json();
}

export async function createRepair(data: {
  defect_id: number;
  assigned_to: string;
  notes?: string;
}) {
  const response = await fetch(
    `${API_URL}/api/repairs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        "Failed to create repair"
    );
  }

  return response.json();
}

export async function updateRepair(
  id: number,
  data: {
    assigned_to?: string;
    status?: string;
    notes?: string;
  }
) {
  const response = await fetch(
    `${API_URL}/api/repairs/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        "Failed to update repair"
    );
  }

  return response.json();
}

export async function getRepairStats() {
  const response = await fetch(
    `${API_URL}/api/repairs/stats`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch repair stats");
  }

  return response.json();
}