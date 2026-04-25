const socket = io();

const joinGroupChatBtn = document.getElementById("joinGroupChat");
const generateAliasBtn = document.getElementById("generateAlias");
const themeToggleBtn = document.getElementById("themeToggle");
const chatWindow = document.getElementById("chatWindow");
const groupChatName = document.getElementById("groupChatName");
const roomCodeLabel = document.getElementById("roomCodeLabel");
const connectionStatus = document.getElementById("connectionStatus");
const copyRoomBtn = document.getElementById("copyRoom");
const clearChatBtn = document.getElementById("clearChat");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const charCounter = document.getElementById("charCounter");
const sendMessageBtn = document.getElementById("sendMessage");
const fileInput = document.getElementById("fileInput");
const mediaIcon = document.getElementById("mediaIcon");
const filePreview = document.getElementById("filePreview");
const previewImage = document.getElementById("previewImage");
const circleLoader = document.getElementById("circle_loader");

const groupNameInput = document.getElementById("groupName");
const groupAliasInput = document.getElementById("groupAlias");

let groupName = "";
let groupAlias = "";

function getRandomAlias() {
  const adjectives = ["Silent", "Neon", "Swift", "Misty", "Nova", "Ghost", "Blue", "Echo"];
  const nouns = ["Fox", "Comet", "Orbit", "River", "Pulse", "Dawn", "Shade", "Pixel"];
  const partA = adjectives[Math.floor(Math.random() * adjectives.length)];
  const partB = nouns[Math.floor(Math.random() * nouns.length)];
  const id = Math.floor(100 + Math.random() * 900);
  return `${partA}${partB}${id}`;
}

function sanitizeName(value, maxLength = 30) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function setTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  localStorage.setItem("quickChatTheme", theme);
  themeToggleBtn.innerHTML = theme === "light"
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

function showToast(text) {
  const toast = document.createElement("div");
  toast.className = "status connected";
  toast.style.position = "fixed";
  toast.style.bottom = "18px";
  toast.style.right = "18px";
  toast.style.zIndex = "50";
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}

function resetMediaInput() {
  fileInput.value = "";
  previewImage.src = "";
  filePreview.style.display = "none";
  mediaIcon.style.display = "block";
  messageInput.disabled = false;
}

function renderMessage({ sender, message, mediaUrl }) {
  const row = document.createElement("div");
  row.className = `message-row ${sender === groupAlias ? "self" : ""}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  const head = document.createElement("div");
  head.className = "message-head";
  head.innerHTML = `<strong>${sender}</strong><span class="message-time">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;
  bubble.appendChild(head);

  if (mediaUrl) {
    const mediaElement = document.createElement("img");
    mediaElement.src = mediaUrl;
    mediaElement.alt = "shared media";
    mediaElement.className = "media-preview";
    bubble.appendChild(mediaElement);
  } else if (message) {
    const textElement = document.createElement("div");
    textElement.textContent = message;
    bubble.appendChild(textElement);
  }

  row.appendChild(bubble);
  messages.appendChild(row);
  messages.scrollTop = messages.scrollHeight;
}

function updateCounter() {
  charCounter.textContent = `${messageInput.value.length} / 700`;
}

generateAliasBtn.addEventListener("click", () => {
  groupAliasInput.value = getRandomAlias();
});

themeToggleBtn.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("light") ? "dark" : "light";
  setTheme(nextTheme);
});

mediaIcon.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    mediaIcon.style.display = "none";
    filePreview.style.display = "block";
    messageInput.disabled = true;
  };
  reader.readAsDataURL(file);
});

previewImage.addEventListener("click", resetMediaInput);

joinGroupChatBtn.addEventListener("click", () => {
  groupName = sanitizeName(groupNameInput.value, 45).toLowerCase();
  groupAlias = sanitizeName(groupAliasInput.value) || getRandomAlias();

  if (!groupName) {
    showToast("Room name is required");
    return;
  }

  groupNameInput.value = groupName;
  groupAliasInput.value = groupAlias;
  groupChatName.textContent = groupName;
  roomCodeLabel.textContent = `Room: ${groupName}`;
  localStorage.setItem("quickChatGroupAlias", groupAlias);

  socket.emit("join-group", { groupName });
  chatWindow.classList.remove("hidden");
  messageInput.focus();
});

copyRoomBtn.addEventListener("click", async () => {
  if (!groupName) return;
  try {
    await navigator.clipboard.writeText(groupName);
    showToast("Room name copied");
  } catch (error) {
    showToast("Clipboard unavailable");
  }
});

clearChatBtn.addEventListener("click", () => {
  messages.innerHTML = "";
});

messageInput.addEventListener("input", updateCounter);
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessageBtn.click();
  }
});

sendMessageBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  const file = fileInput.files[0];

  if (!groupName) {
    showToast("Join a room first");
    return;
  }

  if (file) {
    sendMessageBtn.style.display = "none";
    circleLoader.style.display = "block";
    const formData = new FormData();
    formData.append("media", file);

    fetch("/upload", { method: "POST", body: formData })
      .then((response) => response.json())
      .then((data) => {
        if (data.fileUrl) {
          socket.emit("group-message", {
            groupName,
            sender: groupAlias,
            message: data.fileUrl,
          });
          resetMediaInput();
        }
      })
      .catch(() => {
        showToast("Upload failed");
      })
      .finally(() => {
        sendMessageBtn.style.display = "inline-flex";
        circleLoader.style.display = "none";
      });
    return;
  }

  if (message.length > 0) {
    socket.emit("group-message", { groupName, sender: groupAlias, message });
    messageInput.value = "";
    updateCounter();
  }
});

socket.on("receive-message", ({ sender, message }) => {
  if (typeof message === "string" && message.startsWith("https")) {
    renderMessage({ sender, mediaUrl: message });
  } else {
    renderMessage({ sender, message });
  }
});

socket.on("connect", () => {
  connectionStatus.textContent = "Connected";
  connectionStatus.classList.add("connected");
  connectionStatus.classList.remove("disconnected");
});

socket.on("disconnect", () => {
  connectionStatus.textContent = "Disconnected";
  connectionStatus.classList.add("disconnected");
  connectionStatus.classList.remove("connected");
});

(() => {
  const storedTheme = localStorage.getItem("quickChatTheme") || "dark";
  setTheme(storedTheme);
  groupAliasInput.value = localStorage.getItem("quickChatGroupAlias") || getRandomAlias();
  updateCounter();
})();
