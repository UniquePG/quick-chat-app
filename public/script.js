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
