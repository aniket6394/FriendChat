import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import "./ChatPanel.css";

export default function ChatPanel({ roomId, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  useEffect(() => {
    const onMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    socket.on("receive-message", onMessage);
    return () => {
      socket.off("receive-message", onMessage);
    };
  }, []);
  function handleSend() {
    if (!input.trim()) return;
    socket.emit("send-message", {
      roomId,
      username,
      message: input,
    });

    setInput("");
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="empty-text">Messages will appear here...</p>
        )}

        {messages.map((msg, index) => (
          <div key={index} className="message-card">
            <span className="message-user">{msg.username}</span>

            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter message..."
          className="chat-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />
        <button onClick={handleSend} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
}
