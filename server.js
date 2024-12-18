// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const Redis = require("ioredis");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// // Redis connection for normal operations
// const redisClient = new Redis("rediss://red-cth7mlpopnds73b0056g:XFmqReT2cRJqkKY6ihLkOF0Ve3jwwODd@oregon-redis.render.com:6379");

// // Redis connection for subscribing
// const redisSubscriber = new Redis("rediss://red-cth7mlpopnds73b0056g:XFmqReT2cRJqkKY6ihLkOF0Ve3jwwODd@oregon-redis.render.com:6379");

// redisClient.on("connect", () => {
//   console.log("Connected to Redis for normal operations.");
// });

// redisSubscriber.on("connect", () => {
//   console.log("Connected to Redis for subscribing.");
// });

// redisClient.on("error", (err) => {
//   console.error("Redis Client Error:", err);
// });

// redisSubscriber.on("error", (err) => {
//   console.error("Redis Subscriber Error:", err);
// });

// // Serve static files from the 'public' directory
// app.use(express.static("public"));

// // Listen for incoming socket connections
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // Subscribe to a Redis channel
//   redisSubscriber.subscribe("chat_channel", (err, count) => {
//     if (err) {
//       console.error("Failed to subscribe:", err);
//     } else {
//       console.log(`Subscribed to ${count} channel(s).`);
//     }
//   });

//   // Receive messages from the Redis channel
//   redisSubscriber.on("message", (channel, message) => {
//     console.log(`Message from ${channel}: ${message}`);
//     socket.emit("chat message", message); // Forward the message to connected clients
//   });

//   // Listen for incoming messages from the client
//   socket.on("chat message", async (msg) => {
//     console.log("Message received from client:", msg);

//     // Publish the message to the Redis channel
//     await redisClient.publish("chat_channel", msg);
//   });

//   // Handle disconnect event
//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

// // Start the server
// const PORT = process.env.PORT || 3002;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



//----------------------------------------- one to one and group message---------------------------------//


const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Redis connections
const redisUrl = "rediss://red-cth7mlpopnds73b0056g:XFmqReT2cRJqkKY6ihLkOF0Ve3jwwODd@oregon-redis.render.com:6379"
const redisClient = new Redis(redisUrl);
const redisSubscriber = new Redis(redisUrl);

// Middleware to serve static files
app.use(express.static("public"));

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
    socket.join(privateRoom);
    console.log(`${sender} joined private room: ${privateRoom}`);
  });

  // Handle joining a group/channel
  socket.on("join-group", ({ groupName }) => {
    socket.join(groupName);
    console.log(`User joined group: ${groupName}`);
  });

  // Handle sending messages in private chat
  socket.on("private-message", ({ sender, receiver, message }) => {
    const privateRoom = [sender, receiver].sort().join("-");
    io.to(privateRoom).emit("receive-message", { sender, message });
    console.log(`Private message from ${sender} to ${receiver}: ${message}`);
  });

  // Handle sending messages in group chat
  socket.on("group-message", ({ groupName, sender, message }) => {
    io.to(groupName).emit("receive-message", { sender, message });
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



//------------------------------ with the sender and reciver names -------------------------------------//
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// // Store active users and chats
// const users = {}; // { socketId: username }
// const activeChats = {}; // { roomName: { sender, receiver, status } }

// app.use(express.static('public'));

// // When a user connects
// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // When a user sets their username
//   socket.on('setUsername', (username) => {
//     users[socket.id] = username;
//     console.log(`${username} has joined with ID: ${socket.id}`);
//   });

//   // Handle starting a one-to-one chat
//   socket.on('startChat', ({ sender, receiver }) => {
//     const roomName = `${sender}-${receiver}`;
//     activeChats[roomName] = {
//       sender,
//       receiver,
//       status: 'Pending',
//     };
//     socket.join(roomName);
//     console.log(`Chat started between ${sender} and ${receiver}`);
//     io.to(roomName).emit('chatStatus', activeChats[roomName]);
//   });

//   // Handle joining a one-to-one chat
//   socket.on('joinChat', ({ receiver, sender }) => {
//     const roomName = `${sender}-${receiver}`;
//     if (activeChats[roomName]) {
//       activeChats[roomName].status = 'Active';
//       socket.join(roomName);
//       console.log(`${receiver} has joined the chat with ${sender}`);
//       io.to(roomName).emit('chatStatus', activeChats[roomName]);
//     }
//   });

//   // Handle sending messages
//   socket.on('message', ({ roomName, message, sender }) => {
//     console.log(`Message from ${sender}: ${message}`);
//     io.to(roomName).emit('message', { sender, message });
//   });

//   // Handle user disconnecting
//   socket.on('disconnect', () => {
//     console.log('A user disconnected:', socket.id);
//     const username = users[socket.id];
//     delete users[socket.id];
//   });
// });

// const PORT = process.env.PORT || 3002;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
