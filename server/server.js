const WebSocket = require("ws");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const port = process.env.PORT || 4000;
const socket = new WebSocket.Server({ port });
let typingStatus = {};

socket.on("connection", (ws, req) => {
  console.log("Websocket connection established");

  const query = req.url.split("?")[1].split("=");
  const username = query[0] == "username" ? query[1] : null; // other user not the msg sender

  console.log("wsss", ws);
  ws.on("message", (data) => {
    const msg = JSON.parse(data);
    console.log(msg);
    if (msg.type === "chat-message") {
      sendMessageToAll(ws, msg.sender, msg.text);
      handleTypingIndicator(ws, username, false);
    } else if (msg.type === "typing") {
      handleTypingIndicator(ws, msg.sender, msg.isTyping);
    }
  });

  ws.on("close", function () {
    console.log(`Websocket connection closed`);
    handleTypingIndicator(ws, username, false);
  });

  //   ws.send(JSON.stringify("hello")); // send msg from server to client
  /** but in our case (chatting) there is no msg from server to client directly but,
   * we send msg from client to server
   * and then send it again to other clients to display it in frontend */
});

const sendMessageToAll = (sender, username, msg) => {
  console.log("sender", sender);
  console.log("socket", socket.clients);

  socket.clients.forEach((client) => {
    console.log(WebSocket.OPEN);
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      const data = {
        type: "chat-message",
        username,
        text: msg,
      };
      client.send(JSON.stringify(data));
    }
  });
};

const handleTypingIndicator = (sender, username, isTyping) => {
  //   typingStatus.username = isTyping;

  socket.clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      const data = {
        type: "typing",
        username,
        isTyping,
      };
      client.send(JSON.stringify(data));
    }
  });
};
