require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const sharp = require("sharp"); // For image compression
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Redis connections
const redisUrl = process.env.REDIS_URL;
const redisClient = new Redis(redisUrl);
const redisSubscriber = new Redis(redisUrl);

// Middleware to serve static files
app.use(express.static("public"));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for handling uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Endpoint for uploading media to Cloudinary with compression
app.post("/upload", upload.single("media"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    let compressedBuffer;

    // Compress the media if it's an image
    if (file.mimetype.startsWith("image/")) {
      compressedBuffer = await sharp(file.buffer)
        .resize({ width: 1080 }) // Resize to 1080px width, maintain aspect ratio
        .jpeg({ quality: 70 }) // Compress to 70% quality for JPEG
        .toBuffer();
    } else {
      compressedBuffer = file.buffer; // Use original buffer for non-images
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "chat_app_media" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ error: "Failed to upload media" });
        }
        res.json({ fileUrl: result.secure_url }); // Return the Cloudinary URL
      }
    );

    streamifier.createReadStream(compressedBuffer).pipe(uploadStream);
  } catch (err) {
    console.error("Error processing media:", err);
    res.status(500).json({ error: "Failed to process media" });
  }
});

// Serve chat pages
app.get("/privateChat", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views", "privateChat.html"));
});

app.get("/groupChat", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/views", "groupChat.html"));
});

// Redis connection status
redisClient.on("connect", () => {
  console.log("Connected to Redis for normal operations.");
});
redisSubscriber.on("connect", () => {
  console.log("Connected to Redis for subscribing.");
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle joining a private room
  socket.on("join-private-room", ({ sender, receiver }) => {
    const privateRoom = [sender, receiver].sort().join("-");
    socket.join(privateRoom.toLowerCase());
    console.log(`${sender} joined private room: ${privateRoom}`);
  });

  // Handle joining a group/channel
  socket.on("join-group", ({ groupName }) => {
    socket.join(groupName.toLowerCase());
    console.log(`User joined group: ${groupName.toLowerCase()}`);
  });

  // Handle sending messages in private chat
  socket.on("private-message", ({ sender, receiver, message, mediaUrl }) => {
    const privateRoom = [sender, receiver].sort().join("-");
    io.to(privateRoom.toLowerCase()).emit("receive-message", { sender, message, mediaUrl });
    console.log(`Private message from ${sender} to ${receiver}: ${message}`);
  });

  // Handle sending messages in group chat
  socket.on("group-message", ({ groupName, sender, message, mediaUrl }) => {
    io.to(groupName).emit("receive-message", { sender, message, mediaUrl });
    console.log(`Group message in ${groupName} by ${sender}: ${message}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
