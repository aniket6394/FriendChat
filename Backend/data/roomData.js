const rooms = new Map();
function createRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      host: null,
      users: [],
    });
  }
  return rooms.get(roomId);
}

function handleJoin(socket, io, { roomId, username }) {
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
    });
  }
  if (!room.host) {
    room.host = socket.id;
  }
  io.to(roomId).emit("room-users", {
    users: room.users,
    host: room.host,
  });
  console.log(socket.roomId);
}

function deleteUser(socket, io) {
  const roomId = socket.roomId;
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (!room) return;
  room.users = room.users.filter((u) => u.socketId !== socket.id);
  if (room.host === socket.id) {
    room.host = room.users[0]?.socketId || null;
  }
  if (room.users.length === 0) {
    rooms.delete(roomId);
  } else {
    // 📡 broadcast updated room
    io.to(roomId).emit("room-users", {
      users: room.users,
      host: room.host,
    });
  }
}

module.exports = {
  rooms,
  createRoom,
  handleJoin,
  deleteUser,
};
