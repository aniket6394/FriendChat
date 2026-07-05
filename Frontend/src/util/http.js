import { QueryClient } from "@tanstack/react-query";

export const query = new QueryClient();

const APP_KEY = import.meta.env.VITE_KLIPY_APP_KEY;

// ---------------- CREATE ROOM ----------------

export async function createRoom() {
  const response = await fetch("http://localhost:3000/create-room", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  return response.json();
}

// ---------------- TRENDING GIFS ----------------

export async function getTrendingGifs(username, page = 1) {
  const response = await fetch(
    `https://api.klipy.com/api/v1/${APP_KEY}/gifs/trending`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trending GIFs");
  }

  return response.json();
}

// ---------------- SEARCH GIFS ----------------

export async function searchGifs(username, search, page = 1) {
  const response = await fetch(
    `https://api.klipy.com/api/v1/${APP_KEY}/gifs/search?page=${page}&per_page=20&q=${encodeURIComponent(
      search,
    )}&customer_id=${encodeURIComponent(username)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to search GIFs");
  }

  return response.json();
}
export async function uploadImage(file) {
  const formData = new FormData();

  formData.append("image", file);

  const response = await fetch("http://localhost:3000/upload-image", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  console.log("Response:", data);

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload image");
  }

  return data;
}
