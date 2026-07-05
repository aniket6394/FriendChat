const rooms = new Map();

function createRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      host: null,
      users: [],
      messages: [],
    });
  }

  return rooms.get(roomId);
}

function handleJoin(socket, io, { roomId, username, avatar }) {
  const room = rooms.get(roomId);

  if (!room) return;

  if (room.users.length >= 4) {
    socket.emit("room-full");
    return;
  }

  socket.join(roomId);
  socket.roomId = roomId;

  const exists = room.users.find((u) => u.socketId === socket.id);

  if (!exists) {
    room.users.push({
      socketId: socket.id,
      name: username,
      avatar,

      // Voice / Video State
      mic: false,
    });

    const joinMessage = {
      type: "join",
      message: `${username} joined the room`,
      time: new Date().toLocaleTimeString(),
    };

    room.messages.push(joinMessage);

    io.to(roomId).emit("system-message", joinMessage);
  }

  if (!room.host) {
    room.host = socket.id;
  }

  socket.emit("chat-history", room.messages);

  io.to(roomId).emit("room-users", {
    users: room.users,
    host: room.host,
  });
}

function deleteUser(socket, io) {
  const roomId = socket.roomId;

  if (!roomId) return;

  const room = rooms.get(roomId);

  if (!room) return;

  const deletedUser = room.users.find((u) => u.socketId === socket.id);

  room.users = room.users.filter((u) => u.socketId !== socket.id);

  if (room.host === socket.id) {
    room.host = room.users[0]?.socketId || null;
  }

  if (deletedUser) {
    const leaveMessage = {
      type: "leave",
      message: `${deletedUser.name} left the room`,
      time: new Date().toLocaleTimeString(),
    };

    room.messages.push(leaveMessage);

    io.to(roomId).emit("system-message", leaveMessage);
  }

  if (room.users.length === 0) {
    rooms.delete(roomId);
    return;
  }

  io.to(roomId).emit("room-users", {
    users: room.users,
    host: room.host,
  });
}

function handleMessage(io, { roomId, username, message }) {
  if (!roomId || !username || !message) return;

  const room = rooms.get(roomId);

  if (!room) return;

  const msg = {
    type: "chat",
    username,
    message,
    time: new Date().toLocaleTimeString(),
  };

  room.messages.push(msg);

  io.to(roomId).emit("receive-message", msg);
}

function handleGif(io, { roomId, username, gif }) {
  if (!roomId || !username || !gif) return;

  const room = rooms.get(roomId);

  if (!room) return;

  const msg = {
    type: "gif",
    username,
    gif,
    time: new Date().toLocaleTimeString(),
  };

  room.messages.push(msg);

  io.to(roomId).emit("receive-gif", msg);
}

function handleImage(io, { roomId, username, image }) {
  if (!roomId || !username || !image) return;

  const room = rooms.get(roomId);

  if (!room) return;

  const msg = {
    type: "image",
    username,
    image,
    time: new Date().toLocaleTimeString(),
  };

  room.messages.push(msg);

  io.to(roomId).emit("receive-image", msg);
}

// ===========================
// VOICE STATUS
// ===========================

function handleMic(io, socket, { roomId, enabled }) {
  const room = rooms.get(roomId);

  if (!room) return;

  const user = room.users.find((u) => u.socketId === socket.id);

  if (!user) return;

  user.mic = enabled;

  io.to(roomId).emit("mic-status", {
    socketId: socket.id,
    enabled,
  });
}

module.exports = {
  rooms,
  createRoom,
  handleJoin,
  deleteUser,
  handleMessage,
  handleGif,
  handleImage,
  handleMic,
};
