import { QueryClient } from "@tanstack/react-query";
export const query = new QueryClient();
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
  const data = await response.json();
  return data; // { roomId: "xyz" }
}
