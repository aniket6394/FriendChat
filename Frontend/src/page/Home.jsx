import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createRoom } from "../util/http";
import { useState } from "react";
import toast from "react-hot-toast";
const avatars = [0, 1, 2, 3];

export default function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: createRoom,
    onSuccess: (data, variables) => {
      navigate(`/room/${data.roomId}`, {
        state: {
          username: variables.username,
          avatar: variables.avatar,
        },
      });
    },
  });

  function handleCreateRoom() {
    if (!username.trim()) {
      toast.error("enter username");
      return;
    }

    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    mutate({
      username,
      avatar,
    });
  }

  function handleJoinRoom() {
    if (!username.trim() || !roomIdInput.trim()) {
      toast.error("enter details");
      return;
    }

    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    navigate(`/room/${roomIdInput}`, {
      state: {
        username,
        avatar,
      },
    });
  }

  return (
    <div className="home-container">
      <div className="brand">
        <div className="brand-badge">FC</div>
        <h1 className="title">Friends Chat</h1>
        <p className="subtitle">
          Simple, private rooms for you and your friends
        </p>
      </div>

      <div className="card">
        <label className="field-label">Your name</label>
        <input
          className="input"
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button
          className="button primary"
          onClick={handleCreateRoom}
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create Room"}
        </button>

        <div className="divider">
          <span>or join existing</span>
        </div>

        <label className="field-label">Room ID</label>
        <input
          className="input"
          type="text"
          placeholder="Enter Room ID"
          value={roomIdInput}
          onChange={(e) => setRoomIdInput(e.target.value)}
        />

        <button className="button secondary" onClick={handleJoinRoom}>
          Join Room
        </button>
      </div>
    </div>
  );
}
