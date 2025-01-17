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
    transports: ["websocket"],
    maxHttpBufferSize: 1e10, 
  },
});

const port = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Endpoint to handle the upload speed test
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  let packetsSent = 0;
  let packetsReceived = 0;

  socket.on("ping-message", (sentTime) => {
    packetsSent++;
    socket.emit("pong-message", sentTime);
  });

  // ✅ Acknowledge pong received
  socket.on("pong-received", () => {
    packetsReceived++;
  });

  // ✅ Log packet loss statistics every 5 seconds
  setInterval(() => {
    if (packetsSent > 0) {
      const lossPercentage = ((packetsSent - packetsReceived) / packetsSent) * 100;
      console.log(`Packet Loss: ${lossPercentage.toFixed(2)}%`);
    }
  }, 5000);
  
  socket.on("upload-speed-test", (data) => {
    const startTime = Date.now();
    const chunkSize = data?.byteLength || data?.length ||0; // Size of the data received
    // Simulate upload by echoing the data 
    console.log(chunkSize,"chunkSize")
    socket.emit("upload-speed-response", { startTime, chunkSize });
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
  let receivedSize = 0;

  
  socket.on("upload-chunk", ({ chunk }) => {
    receivedSize += chunk.length;
  });

  socket.on("upload-complete", ({ startTime }) => {
    const endTime = Date.now();
    const totalSize = receivedSize;
    receivedSize = 0; // Reset for next test

    console.log(`Total Received Size: ${(totalSize / 1048576).toFixed(2)} MB`);
    socket.emit("upload-success", { totalSize, startTime, endTime });
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
