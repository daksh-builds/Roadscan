import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function detectDefects(imagePath) {
  const form = new FormData();

  const actualPath = imagePath.startsWith("/")
    ? imagePath.slice(1)
    : imagePath;

  form.append("file", fs.createReadStream(actualPath));

  const response = await axios.post(
    `${AI_SERVICE_URL}/predict`,
    form,
    {
      headers: form.getHeaders()
    }
  );

  return response.data;
}