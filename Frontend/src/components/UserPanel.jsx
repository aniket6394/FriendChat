import "./UserPanel.css";

export default function UserPanel({ name, host }) {
  // empty slot
  if (!name) {
    return (
      <div className="name-panel empty">
        <p>Empty</p>
      </div>
    );
  }

  return (
    <div className="name-panel">
      <h2>
        {name.name}
        {name.socketId === host && " 👑"}
      </h2>
    </div>
  );
}
