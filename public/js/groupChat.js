const socket = io();

// Group Chat Elements
const joinGroupChatBtn = document.getElementById('joinGroupChat');
const chatWindow = document.getElementById('chatWindow');
const groupChatName = document.getElementById('groupChatName');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');

const fileInput = document.getElementById('fileInput');
const mediaIcon = document.getElementById('mediaIcon');

const filePreview = document.getElementById('filePreview');
const previewImage = document.getElementById('previewImage');
const removeFileIcon = document.getElementById('removeFileIcon');
const filePreviewContainer = document.getElementById('filePreviewContainer');
const circleLoader = document.getElementById('circle_loader');

const screenWidth = window.innerWidth;

let groupName;


// open file input on the click on the paper icon
mediaIcon.addEventListener('click', () => {
  fileInput.click(); // Programmatically trigger the file input click
});


// Show the preview when a file is selected
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      mediaIcon.style.display = 'none'; // Hide the paperclip icon
      filePreview.style.display = 'block'; // Show the file preview

      if(screenWidth <= 768){
            filePreviewContainer.style.top = "6px"
            filePreviewContainer.style.right = "3px"
      }else{
        filePreviewContainer.style.top = "6px"
        filePreviewContainer.style.right = "-20px"
      }

      messageInput.disabled = true

    };
    reader.readAsDataURL(file);
  }
});


// Remove the selected file and reset the preview
previewImage.addEventListener('click', () => {
  fileInput.value = ''; 
  previewImage.src = ''; 
  filePreview.style.display = 'none'; 
  mediaIcon.style.display = 'block'; 

  if(screenWidth <= 768){
    filePreviewContainer.style.top = "15px"
    filePreviewContainer.style.right = "14px"

  }else{
    filePreviewContainer.style.top = "18px"
    filePreviewContainer.style.right = "-7px"
  }

  messageInput.disabled = false

});



// Join Group Chat
joinGroupChatBtn.addEventListener('click', () => {
    groupName = document.getElementById('groupName').value;

  if (groupName) {
    groupChatName.textContent = groupName;
    socket.emit('join-group', { groupName });
    chatWindow.classList.remove('hidden');
  }
});



// Send Message
sendMessageBtn.addEventListener('click', () => {
  const message = messageInput.value;

  const file = fileInput.files[0];


  if (file) {
    // If a file is selected, upload it to the server
    sendMessageBtn.style.display = "none";
    circleLoader.style.display = "block";

    const formData = new FormData();
    formData.append('media', file);

    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.fileUrl) {
          // Emit the media URL to the private chat room
          socket.emit('group-message', {
            groupName,
            sender: 'Anonymous',
            message: data.fileUrl,
            // message: `<a href="${data.fileUrl}" target="_blank"><img src="${data.fileUrl}" alt="media" style="max-width: 200px;"/></a>`,
          });
          // appendMessage('You sent a media file.');
          fileInput.value = ''; // Clear the file input
          filePreview.style.display = "none";
          mediaIcon.style.display = 'block';

          if(screenWidth <= 768){
            filePreviewContainer.style.top = "15px"
            filePreviewContainer.style.right = "14px"

          }else{
            filePreviewContainer.style.top = "18px"
            filePreviewContainer.style.right = "-7px"
          }

          sendMessageBtn.style.display = "block";
          circleLoader.style.display = "none";
          messageInput.disabled = false
        }
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });

    }else if (message.trim() !== '') {

      socket.emit('group-message', { groupName, sender: 'Anonymous', message });
      // appendMessage(`You: ${message}`);
      messageInput.value = ''; // Clear the text input
    }


  // if (message) {
  //   socket.emit('group-message', { groupName, sender: 'Anonymous', message });
  //   // appendMessage(`You: ${message}`);
  //   messageInput.value = '';
  // }
});


// Receive Message
socket.on('receive-message', ({ sender, message }) => {
  // appendMessage(`${sender}: ${message}`);
  if(message.startsWith("https")){
    appendMessage({sender, mediaUrl: message});

  }else{
    appendMessage({sender,message});
  }
});



function appendMessage({sender, message, mediaUrl}) {
  const messageElement = document.createElement("div");
  
  // Sender name
  const senderElement = document.createElement("strong");
  senderElement.textContent = `${sender}: `;
  messageElement.appendChild(senderElement);

  // Check if the message contains media or text
  if (mediaUrl) {
    // Render media (e.g., image or other supported formats)
    const mediaElement = document.createElement("img");
    mediaElement.src = mediaUrl; // Use the media URL
    mediaElement.alt = "media";
    mediaElement.style.maxWidth = "200px"; // Restrict max size
    mediaElement.style.borderRadius = "8px";
    mediaElement.style.marginTop = "5px";
    messageElement.appendChild(mediaElement);
  } else if (message) {
    // Render text message
    const textElement = document.createElement("span");
    textElement.textContent = message;
    messageElement.appendChild(textElement);
  }

  // Add the message element to the messages container
  messages.appendChild(messageElement);
  messages.scrollTop = messages.scrollHeight;


}
