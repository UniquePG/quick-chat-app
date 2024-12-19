const socket = io();

// Private Chat Elements
const startChatBtn = document.getElementById('startChat');
const chatWindow = document.getElementById('chatWindow');
const senderName = document.getElementById('senderName');
const receiverName = document.getElementById('receiverName');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');

let roomName;
let currentChatType = null;
let privateReceiver = "";

// Start Chat
startChatBtn.addEventListener('click', () => {
  const sender = document.getElementById('privateSender').value;
  privateReceiver = document.getElementById('privateReceiver').value;

  if (sender && privateReceiver) {
    roomName = `${sender}-${privateReceiver}`;
    senderName.textContent = sender;
    receiverName.textContent = privateReceiver;

    socket.emit('join-private-room', { sender, receiver: privateReceiver });
    chatWindow.classList.remove('hidden');
  }
});



// Send Message
sendMessageBtn.addEventListener('click', () => {
    const sender = document.getElementById("privateSender").value;
  const message = messageInput.value;
  if (message) {
    socket.emit('private-message', { sender, receiver: privateReceiver, message });
    // appendMessage(`You: ${message}`);
    messageInput.value = '';
  }
});

// Receive Message
socket.on('receive-message', ({ sender, message }) => {
    appendMessage(`${sender}: ${message}`);
  });

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messages.appendChild(messageElement);
}
