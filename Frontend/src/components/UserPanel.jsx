import "./UserPanel.css";
import { FaCrown, FaMicrophone, FaVideo, FaCircle } from "react-icons/fa";
import avatar1 from "./avatars/avatar1.png";
import avatar2 from "./avatars/avatar2.png";
import avatar3 from "./avatars/avatar3.png";
import avatar4 from "./avatars/avatar4.png";
import toast from "react-hot-toast";
const avatars = [avatar1, avatar2, avatar3, avatar4];

export default function UserPanel({ name, host }) {
  return (
    <div className={`user-card ${name.socketId === host ? "host-card" : ""}`}>
      <img src={avatars[name.avatar]} alt="avatar" className="avatar" />

      <div className="user-info">
        <div className="top-row">
          <span className="username">{name.name}</span>

          {name.socketId === host && <FaCrown className="host-icon" />}
        </div>

        <div className="bottom-row">
          <span className="status">
            <FaCircle className="online-dot" />
            Online
          </span>

          <div className="actions">
            <button title="Microphone">
              <FaMicrophone />
            </button>

            <button title="Video">
              <FaVideo />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
