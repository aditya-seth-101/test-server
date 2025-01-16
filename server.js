require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path"); // Import path module

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  let packetsSent = 0;
  let packetsReceived = 0;

  socket.on("ping-message", (sentTime) => {
    packetsSent++;
    socket.emit("pong-message", sentTime);
  });

  socket.on("pong-received", () => {
    packetsReceived++;
  });

  // Send packet loss stats every 5 seconds
  setInterval(() => {
    if (packetsSent > 0) {
      const lossPercentage = ((packetsSent - packetsReceived) / packetsSent) * 100;
      console.log(`Packet Loss: ${lossPercentage.toFixed(2)}%`);
    }
  }, 5000);

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected (${socket.id}): ${reason}`);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`Client reconnected on attempt ${attemptNumber}: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
