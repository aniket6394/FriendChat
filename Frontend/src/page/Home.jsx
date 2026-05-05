import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createRoom } from "../util/http";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");

  const { mutate } = useMutation({
    mutationFn: createRoom,
    onSuccess: (data) => {
      navigate(`/room/${data.roomId}`, {
        state: { username },
      });
    },
  });
  function handleCreateRoom() {
    mutate();
  }
  function handleJoinRoom() {
    if (!username || !roomIdInput) {
      alert("Fill all fields");
      return;
    }
    navigate(`/room/${roomIdInput}`, {
      state: { username },
    });
  }
  return (
    <div className="container">
      <div className="card">
        <h1>Welcome to Friends Chat</h1>

        <input
          className="input"
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button className="button" onClick={handleCreateRoom}>
          Create Room
        </button>

        <div className="divider">OR</div>

        <input
          className="input"
          placeholder="Enter Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
        />

        <button className="button" onClick={handleJoinRoom}>
          Join Room
        </button>
      </div>
    </div>
  );
}
