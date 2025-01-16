require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    maxHttpBufferSize: 1e8, 
  },
});

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Endpoint to handle the upload speed test
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("upload-test", (data) => {
    const receivedSize = Buffer.byteLength(data, "utf8"); // Get the string size in bytes
    console.log(`Received ${receivedSize / 1024} KB from ${socket.id}`);

    // Send back the data to test download speed
    socket.emit("download-test", data);
  });

  socket.on("download-speed-test", () => {
    const startTime = Date.now();
    const chunk = Buffer.alloc(10 * 1024 * 1024); // 10MB chunk (you can adjust the size)
    console.log("download-speed-response triggererd");
    // Simulate download speed by sending a large chunk of data
    socket.emit("download-speed-response", { startTime, chunk });
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected (${socket.id}): ${reason}`);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`Client reconnected on attempt ${attemptNumber}:`, socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
