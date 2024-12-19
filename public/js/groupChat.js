const socket = io();

// Group Chat Elements
const joinGroupChatBtn = document.getElementById('joinGroupChat');
const chatWindow = document.getElementById('chatWindow');
const groupChatName = document.getElementById('groupChatName');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');

let groupName;

// Join Group Chat
joinGroupChatBtn.addEventListener('click', () => {
    groupName = document.getElementById('groupName').value;

  if (groupName) {
    groupChatName.textContent = groupName;
    socket.emit('join-group', { groupName });
    chatWindow.classList.remove('hidden');
  }
});

// Receive Message
socket.on('receive-message', ({ sender, message }) => {
  appendMessage(`${sender}: ${message}`);
});

// Send Message
sendMessageBtn.addEventListener('click', () => {
  const message = messageInput.value;
  if (message) {
    socket.emit('group-message', { groupName, sender: 'Anonymous', message });
    // appendMessage(`You: ${message}`);
    messageInput.value = '';
  }
});

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messages.appendChild(messageElement);
}
