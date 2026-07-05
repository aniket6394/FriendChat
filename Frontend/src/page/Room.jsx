import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { socket } from "../socket/socket";
import useMedia from "../hooks/useMedia";

import ChatPanel from "../components/ChatPanel";
import UserPanel from "../components/UserPanel";
import "./Room.css";
import toast from "react-hot-toast";

export default function Room() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { toggleMic, toggleVideo, micEnabled } = useMedia(id);
  const username = location.state?.username;
  const avatar = location.state?.avatar;

  const [users, setUsers] = useState([]);
  const [host, setHost] = useState(null);
  const [mySocketId, setMySocketId] = useState("");
  useEffect(() => {
    const onMicStatus = ({ socketId, enabled }) => {
      setUsers((prev) =>
        prev.map((user) =>
          user.socketId === socketId ? { ...user, mic: enabled } : user,
        ),
      );
    };
    socket.on("mic-status", onMicStatus);
    return () => {
      socket.off("mic-status", onMicStatus);
    };
  }, []);
  useEffect(() => {
    if (socket.connected) {
      setMySocketId(socket.id);
    }
    socket.on("connect", () => {
      setMySocketId(socket.id);
    });
    return () => {
      socket.off("connect");
    };
  }, []);
  useEffect(() => {
    if (!id || !username) {
      return;
    }

    socket.emit("join-room", {
      roomId: id,
      username,
      avatar,
    });

    const onUsers = (data) => {
      setUsers(data.users);
      setHost(data.host);
    };

    const onFull = () => {
      toast.error("Room is full");
      navigate("/");
    };

    const onInvalid = () => {
      toast.error("room does not exist");
      navigate("/");
    };

    socket.on("room-users", onUsers);
    socket.on("room-full", onFull);
    socket.on("invalid-room", onInvalid);

    return () => {
      socket.off("room-users", onUsers);
      socket.off("room-full", onFull);
      socket.off("invalid-room", onInvalid);

      socket.emit("leave-room");
    };
  }, [id, username, avatar, navigate]);

  return (
    <div className="room-container">
      <div className="members-panel">
        <div className="room-members">
          <h2>👥 Room Members</h2>
          <span>{users.length}/4</span>
        </div>

        {users.map((user) => (
          <UserPanel
            key={user.socketId}
            name={user}
            host={host}
            isMe={user.socketId === mySocketId}
            toggleMic={toggleMic}
            micEnabled={micEnabled}
          />
        ))}
      </div>

      <div className="chat-section">
        <div className="room-header">
          <div className="room-title">Room ID: {id}</div>

          <button
            className="copy-room-btn"
            onClick={() => {
              navigator.clipboard.writeText(id);
              toast.success("Room ID copied!");
            }}
          >
            📋 Copy
          </button>
        </div>

        <ChatPanel username={username} roomId={id} />
      </div>
    </div>
  );
}
