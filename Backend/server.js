const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const {
  rooms,
  createRoom,
  handleJoin,
  deleteUser,
} = require("./data/roomData.js");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
//////////////////////////////////
//////////////////////////////////
io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { roomId } = data;

    if (!rooms.has(roomId)) {
      socket.emit("invalid-room");
      return;
    }
    // 👇 first add user to room
    handleJoin(socket, io, data);

    // 👇 then notify others
  });

  socket.on("disconnect", (reason) => {
    const roomId = socket.roomId;
    const room = rooms.get(roomId);
    console.log("disocnneding");
    deleteUser(socket, io);
    const updated = rooms.get(roomId);
  });
});
/////////////////////////////////////
/////////////////////////////////////
app.post("/create-room", async (req, res) => {
  try {
    const roomId = Math.floor(Math.random() * 1000000).toString();

    createRoom(roomId);

    res.json({
      roomId,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to create room",
    });
  }
});
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
