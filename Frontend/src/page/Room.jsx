import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import { generateName } from "../util/name";

import ChatPanel from "../components/ChatPanel";
import UserPanel from "../components/UserPanel";

import "./Room.css";

export default function Room() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [username] = useState(() => generateName());

  const [users, setUsers] = useState([]);
  const [host, setHost] = useState(null);

  useEffect(() => {
    if (!id || !username) return;

    socket.emit("join-room", {
      roomId: id,
      username,
    });

    const onUsers = (data) => {
      setUsers(data.users);
      setHost(data.host);
    };

    const onFull = () => {
      alert("Room is full");
      navigate("/");
    };

    const onInvalid = () => {
      alert("Room does not exist");
      navigate("/");
    };

    const onUserLeft = (data) => {
      alert(`${data.name} left the room`);
    };

    socket.on("room-users", onUsers);
    socket.on("room-full", onFull);
    socket.on("invalid-room", onInvalid);
    socket.on("user-left", onUserLeft);

    return () => {
      socket.off("room-users", onUsers);
      socket.off("room-full", onFull);
      socket.off("invalid-room", onInvalid);
      socket.off("user-left", onUserLeft);

      socket.emit("leave-room");
    };
  }, []);

  return (
    <div className="room-container">
      {/* LEFT SIDE */}
      <div className="side-panel">
        <UserPanel name={users[0]} host={host} />
        <UserPanel name={users[1]} host={host} />
      </div>

      {/* CENTER CHAT */}
      <div className="chat-section">
        <div className="room-header">Room ID: {id}</div>

        <ChatPanel username={username} roomId={id} />
      </div>

      {/* RIGHT SIDE */}
      <div className="side-panel">
        <UserPanel name={users[2]} host={host} />
        <UserPanel name={users[3]} host={host} />
      </div>
    </div>
  );
}
