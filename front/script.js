let username = "";
while (!username.trim()) {
  username = prompt("Please, enter your username:");
}

const socket = new WebSocket(`ws://localhost:4000?username=${username}`);

socket.onopen = () => {
  console.log("Connected to web socket");
};
socket.onclose = () => {
  console.log("Connection to web socket closed");
};

const sendMsg = () => {
  const msgInput = document.getElementById("messageInput");
  const msg = msgInput.value.trim();

  if (msg) {
    const msgObj = {
      type: "chat-message",
      sender: username,
      text: msg,
    };
    socket.send(JSON.stringify(msgObj));

    msgInput.value = "";
    displayMsg(username, msg);
  }
};

const sendBtn = document.getElementById("send-btn");
sendBtn.onclick = (e) => {
  e.preventDefault();
  sendMsg();
};

/** On message sent from server (another user sends a message and want to display it to the other users)*/
socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(msg);

  if (msg.type === "chat-message") {
    displayMsg(msg.username, msg.text);
  } else if ((msg.type = "typing")) {
    displayTypingIndicator(msg.username, msg.isTyping);
  }
};

const displayMsg = (sender, message) => {
  const msgUl = document.getElementById("messages");
  const li = document.createElement("li");

  li.innerHTML = `<span class="sender-name">${sender} : </span> ${message}`;
  msgUl.append(li);
};

const displayTypingIndicator = (sender, isTyping) => {
  const indicator = document.getElementById("typingIndicator");
  if (isTyping) {
    indicator.innerHTML = `<span class="sender-name">${sender}</span> is typing ...`;
  } else {
    indicator.innerHTML = "";
  }
};

/** send typing indicate to the server */
const handleTypingIndicator = () => {
  const msgInput = document.getElementById("messageInput");
  const isTyping = msgInput.value.trim() != "";
  console.log(msgInput.value, isTyping);
  const data = {
    type: "typing",
    sender: username,
    isTyping,
  };
  socket.send(JSON.stringify(data));
};

const msgInput = document.getElementById("messageInput");
msgInput.oninput = (e) => handleTypingIndicator();
