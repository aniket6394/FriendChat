import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import { generateName } from "../util/name";

export default function Room() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [username] = useState(() => {
    return (
      location.state?.username || localStorage.getItem("name") || generateName()
    );
  });
  const [users, setUsers] = useState([]);
  const [host, setHost] = useState(null);
  useEffect(() => {
    if (location.state?.username) {
      localStorage.setItem("name", location.state.username);
    } else if (!localStorage.getItem("name")) {
      localStorage.setItem("name", username);
    }
  }, [username, location.state]);
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

    socket.on("room-users", onUsers);
    socket.on("room-full", onFull);
    socket.on("invalid-room", onInvalid);

    return () => {
      socket.off("room-users", onUsers);
      socket.off("room-full", onFull);
      socket.off("invalid-room", onInvalid);
    };
  }, [id, username, navigate]);

  return (
    <>
      <p>Room ID: {id}</p>
      <h3>Users:</h3>
      {users.map((user) => (
        <p key={user.socketId}>
          {user.name}
          {user.socketId === host && " 👑"}
        </p>
      ))}
    </>
  );
}
