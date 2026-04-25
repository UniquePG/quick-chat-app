const privateLink = document.getElementById("privateChatBtn");
const groupLink = document.getElementById("groupChatBtn");

function withRipple(event) {
  const target = event.currentTarget;
  target.style.transform = "scale(0.99)";
  setTimeout(() => {
    target.style.transform = "";
  }, 120);
}

privateLink?.addEventListener("click", withRipple);
groupLink?.addEventListener("click", withRipple);
