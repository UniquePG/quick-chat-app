const socket = io();

const privateChatBtn = document.getElementById("privateChatBtn");
const groupChatBtn = document.getElementById("groupChatBtn");
const privateChatForm = document.getElementById("privateChatForm");
const groupChatForm = document.getElementById("groupChatForm");
const chatWindow = document.getElementById("chatWindow");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendMessage = document.getElementById("sendMessage");

let currentChatType = null;
let privateReceiver = "";
let groupName = "";

// Toggle forms
privateChatBtn.addEventListener("click", () => {
  privateChatForm.classList.remove("hidden");
  groupChatForm.classList.add("hidden");
  chatWindow.classList.add("hidden");
  currentChatType = "private";
});

groupChatBtn.addEventListener("click", () => {
  groupChatForm.classList.remove("hidden");
  privateChatForm.classList.add("hidden");
  chatWindow.classList.add("hidden");
  currentChatType = "group";
});

// Start private chat
document.getElementById("startPrivateChat").addEventListener("click", () => {
  const sender = document.getElementById("privateSender").value;
  privateReceiver = document.getElementById("privateReceiver").value;

  socket.emit("join-private-room", { sender, receiver: privateReceiver });
  chatWindow.classList.remove("hidden");
  privateChatForm.classList.add("hidden");
});

// Join group chat
document.getElementById("joinGroupChat").addEventListener("click", () => {
  groupName = document.getElementById("groupName").value;

  socket.emit("join-group", { groupName });
  chatWindow.classList.remove("hidden");
  groupChatForm.classList.add("hidden");
});

// Send message
sendMessage.addEventListener("click", () => {
  const message = messageInput.value;

  if (currentChatType === "private") {
    const sender = document.getElementById("privateSender").value;
    socket.emit("private-message", { sender, receiver: privateReceiver, message });
  } else if (currentChatType === "group") {
    const sender = "Anonymous"; // Or get from input
    socket.emit("group-message", { groupName, sender, message });
  }

  messageInput.value = "";
});

// Receive messages
socket.on("receive-message", ({ sender, message }) => {
  const msg = document.createElement("div");
  msg.textContent = `${sender}: ${message}`;
  messages.appendChild(msg);
});




//----------------------------------- with sender and receiver names -------------------------------//




// const socket = io();

// // UI Elements
// const setUsernameForm = document.getElementById('setUsernameForm');
// const chatForm = document.getElementById('chatForm');
// const messages = document.getElementById('messages');
// const roomInfo = document.getElementById('roomInfo');

// let currentRoom = null;
// let username = null;

// // Set username
// setUsernameForm.addEventListener('submit', (e) => {
//   e.preventDefault();
//   username = document.getElementById('username').value;
//   socket.emit('setUsername', username);
//   document.getElementById('usernameSection').style.display = 'none';
//   document.getElementById('chatSection').style.display = 'block';
// });

// // Start a one-to-one chat
// chatForm.addEventListener('submit', (e) => {
//   e.preventDefault();
//   const receiver = document.getElementById('receiver').value;
//   const message = document.getElementById('message').value;

//   if (!currentRoom) {
//     const sender = username;
//     socket.emit('startChat', { sender, receiver });
//     currentRoom = `${sender}-${receiver}`;
//   }

//   if (message) {
//     socket.emit('message', { roomName: currentRoom, message, sender: username });
//     appendMessage(`You: ${message}`);
//     document.getElementById('message').value = '';
//   }
// });

// // Update chat status
// socket.on('chatStatus', ({ sender, receiver, status }) => {
//   roomInfo.innerHTML = `Chat between <b>${sender}</b> and <b>${receiver}</b> is <b>${status}</b>`;
// });

// // Receive messages
// socket.on('message', ({ sender, message }) => {
//   appendMessage(`${sender}: ${message}`);
// });

// // Append message to chat
// function appendMessage(message) {
//   const messageElement = document.createElement('li');
//   messageElement.innerText = message;
//   messages.appendChild(messageElement);
// }
