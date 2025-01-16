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
  },
});

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Endpoint to handle the upload speed test
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("upload-speed-test", (data) => {
    const startTime = Date.now();
    const chunkSize = data.length; // Size of the data received

    // Simulate upload by echoing the data back
    socket.emit("upload-speed-response", { startTime, chunkSize });
  });

  socket.on("download-speed-test", () => {
    const startTime = Date.now();
    const chunk = Buffer.alloc(10 * 1024 * 1024); // 10MB chunk (you can adjust the size)

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
