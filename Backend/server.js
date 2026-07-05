const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
// console.log(process.env.CLOUDINARY_CLOUD_NAME);
// console.log(process.env.CLOUDINARY_API_KEY);
// console.log(process.env.CLOUDINARY_API_SECRET);
const upload = require("./middleware/upload");
const cloudinary = require("./config/cloudinary");
const streamifier = require("streamifier");
const {
  rooms,
  createRoom,
  handleJoin,
  deleteUser,
  handleMessage,
  handleGif,
  handleImage,
  handleMic,
} = require("./data/roomData");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});
io.on("connection", (socket) => {
  // ---------------- JOIN ----------------

  socket.on("join-room", (data) => {
    const { roomId } = data;

    if (!rooms.has(roomId)) {
      socket.emit("invalid-room");
      return;
    }

    handleJoin(socket, io, data);
  });

  // ---------------- CHAT ----------------

  socket.on("typing", (data) => {
    socket.to(data.roomId).emit("typing", {
      username: data.username,
    });
  });

  socket.on("send-message", (data) => {
    handleMessage(io, data);
  });

  socket.on("send-gif", (data) => {
    handleGif(io, data);
  });

  socket.on("send-image", (data) => {
    handleImage(io, data);
  });

  // ---------------- VOICE ----------------

  socket.on("mic-status", (data) => {
    handleMic(io, socket, data);
  });
  // ---------------- WEBRTC SIGNALING ----------------

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", {
      socketId: socket.id,
      offer,
    });
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", {
      socketId: socket.id,
      answer,
    });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", {
      socketId: socket.id,
      candidate,
    });
  });

  // ---------------- LEAVE ----------------

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

app.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded",
      });
    }
    // console.log(req.file);

    // console.log("Buffer exists:", !!req.file.buffer);

    // console.log("Buffer size:", req.file.buffer.length);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "friend-chat",
      },
      (error, result) => {
        if (error) {
          console.log("Cloudinary Error:");
          console.log(error);

          return res.status(500).json({
            error: error.message,
          });
        }

        res.json({
          url: result.secure_url,
        });
      },
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    res.status(500).json({
      error: "Server Error",
    });
  }
});
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
