const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function uploadInspection(
  roadId: number,
  image: File
) {
  const formData = new FormData();

  formData.append("road_id", roadId.toString());
  formData.append("image", image);

  const response = await fetch(
    `${API_URL}/api/inspections`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Inspection upload failed");
  }

  return response.json();
}