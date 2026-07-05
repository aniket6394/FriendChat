import { useEffect, useRef, useState } from "react";
import { socket } from "../socket/socket";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import GifPicker from "./gifPicker";
import { useMutation } from "@tanstack/react-query";
import { uploadImage } from "../util/http";
import {
  FaSmile,
  FaImage,
  FaPaperclip,
  FaVideo,
  FaMicrophone,
  FaPaperPlane,
  FaGift,
} from "react-icons/fa";
import "./ChatPanel.css";

export default function ChatPanel({ roomId, username }) {
  const [showGif, setShowGif] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [typing, setTyping] = useState("");

  const imageRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimeout = useRef(null);

  // Auto scroll container
  const messagesRef = useRef(null);
  useEffect(() => {
    const onHistory = (history) => {
      setMessages(history);
    };

    socket.on("chat-history", onHistory);

    return () => {
      socket.off("chat-history", onHistory);
    };
  }, []);
  useEffect(() => {
    const onMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    const onSystemMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    const onGif = (data) => {
      setMessages((prev) => [...prev, data]);
    };
    const onImage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const onTyping = (data) => {
      if (data.username === username) return;

      setTyping(`${data.username} is typing...`);

      clearTimeout(typingTimeout.current);

      typingTimeout.current = setTimeout(() => {
        setTyping("");
      }, 1000);
    };
    socket.on("receive-image", onImage);
    socket.on("receive-gif", onGif);
    socket.on("receive-message", onMessage);
    socket.on("typing", onTyping);
    socket.on("system-message", onSystemMessage);
    return () => {
      socket.off("receive-message", onMessage);
      socket.off("typing", onTyping);
      socket.off("system-message", onSystemMessage);
      socket.off("receive-gif", onGif);
      socket.off("receive-image", onImage);
    };
  }, [username]);

  // Auto Scroll
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;

    socket.emit("send-message", {
      roomId,
      username,
      message: input,
    });

    setInput("");
    setShowEmoji(false);
  }

  function handleEmojiClick(emojiData) {
    setInput((prev) => prev + emojiData.emoji);
  }
  const { mutate: upload } = useMutation({
    mutationFn: uploadImage,

    onSuccess: (data) => {
      socket.emit("send-image", {
        roomId,
        username,
        image: data.url,
      });

      toast.success("Image sent");
    },

    onError: () => {
      toast.error("Failed to upload image");
    },
  });
  function handleImageUpload(e) {
    // console.log("images ent");
    const file = e.target.files[0];

    if (!file) return;

    upload(file);
  }

  return (
    <div className="chat-panel">
      <div ref={messagesRef} className="chat-messages">
        {messages.length === 0 && (
          <p className="empty-text">Messages will appear here...</p>
        )}

        {messages.map((msg, index) => {
          if (msg.type === "join" || msg.type === "leave") {
            return (
              <div key={index} className="system-message">
                <span>
                  {msg.type === "join" ? "🟢" : "🔴"} {msg.message}
                </span>
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`message-card ${
                msg.username === username ? "my-message" : "other-message"
              }`}
            >
              <div className="message-user">{msg.username}</div>

              {msg.type === "gif" ? (
                <img src={msg.gif} alt="GIF" className="chat-gif" />
              ) : msg.type === "image" ? (
                <img src={msg.image} alt="Shared" className="chat-image" />
              ) : (
                <div className="message-text">{msg.message}</div>
              )}

              <div className="message-time">{msg.time}</div>
            </div>
          );
        })}
      </div>

      <div className="typing-status">{typing}</div>

      <div className="chat-bottom">
        <div className="emoji-container">
          <button
            className="chat-icon"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            <FaSmile />
          </button>

          {showEmoji && (
            <div className="emoji-picker">
              <EmojiPicker theme="dark" onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>
        <button
          className="inside-icon"
          title="GIF"
          onClick={() => setShowGif(true)}
        >
          <FaGift />
        </button>
        {showGif && (
          <GifPicker
            username={username}
            roomId={roomId}
            close={() => setShowGif(false)}
          />
        )}
        <button className="chat-icon" onClick={() => imageRef.current.click()}>
          <FaImage />
        </button>

        <div className="input-box">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);

              socket.emit("typing", {
                roomId,
                username,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />

          <button className="inside-icon">
            <FaMicrophone />
          </button>

          <button className="inside-icon">
            <FaVideo />
          </button>
        </div>

        <button className="send-btn" onClick={handleSend}>
          <FaPaperPlane />
        </button>

        <input
          hidden
          type="file"
          accept="image/*"
          ref={imageRef}
          onChange={handleImageUpload}
        />

        <input hidden type="file" ref={fileRef} />
      </div>
    </div>
  );
}
