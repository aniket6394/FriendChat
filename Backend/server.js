const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const {
  rooms,
  createRoom,
  handleJoin,
  deleteUser,
  handleMessage,
} = require("./data/roomData");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { roomId } = data;

    if (!rooms.has(roomId)) {
      socket.emit("invalid-room");
      return;
    }

    handleJoin(socket, io, data);
  });
  socket.on("send-message", (data) => {
    handleMessage(io, data);
  });
  socket.on("leave-room", () => {
    deleteUser(socket, io);
  });
  socket.on("disconnect", () => {
    deleteUser(socket, io);
  });
});

app.post("/create-room", (req, res) => {
  try {
    const roomId = Math.floor(Math.random() * 1_000_000).toString();
    createRoom(roomId);
    res.json({ roomId });
  } catch {
    res.status(500).json({ error: "Failed to create room" });
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
