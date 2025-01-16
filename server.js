const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 8000


// Chaos function to simulate latency and packet loss
const introduceChaos = (callback) => {
  const latency = Math.random() * 700; // Random latency between 0 and 700ms
  const packetLoss = Math.random() < 0.2; // 20% chance of packet loss

  setTimeout(() => {
    if (!packetLoss) {
      callback();
    } else {
      console.log("Packet lost!");
    }
  }, latency);
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Handle ping message from client
  socket.on("ping-message", (sentTime) => {
    introduceChaos(() => {
      socket.emit("pong-message", sentTime);
    });
  });

  // Handle client disconnect
  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected (${socket.id}): ${reason}`);
  });

  // Handle client reconnection
  socket.on("reconnect", (attemptNumber) => {
    console.log(`Client reconnected on attempt ${attemptNumber}:`, socket.id);
  });
});
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});