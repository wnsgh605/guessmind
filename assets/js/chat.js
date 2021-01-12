import { getSocket } from "./sockets";

const messages = document.getElementById("jsMessages");
const sendMessage = document.getElementById("jsSendMsg");

const appendMsg = (text, nickname) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <span class="author ${nickname ? "out" : "self"}">
    ${nickname ? nickname : "You"}:</span> ${text}
  `;
  messages.appendChild(li);
};

const handleSendMessage = (event) => {
  event.preventDefault();
  const input = sendMessage.querySelector("input");
  const { value } = input;
  getSocket().emit(window.events.sendMessage, { message: value });
  input.value = "";
  appendMsg(value);
};

export const handleNewMessage = ({ message, nickname }) =>
  appendMsg(message, nickname);

export const disableChat = () => {
  sendMessage.style.display = "none";
};
export const enableChat = () => {
  sendMessage.style.display = "flex";
};

if (sendMessage) {
  sendMessage.addEventListener("submit", handleSendMessage);
}
