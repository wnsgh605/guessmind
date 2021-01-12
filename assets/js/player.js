import { disableChat, enableChat } from "./chat";
import {
  disableCanvas,
  enableCanvas,
  hideControls,
  resetCanvas,
  showControls,
} from "./paint";

const board = document.getElementById("jsPBoard");
const notif = document.getElementById("jsNotif");

const addPlayers = (players) => {
  board.innerHTML = "";
  players.forEach((player) => {
    const playerElement = document.createElement("span");
    playerElement.innerText = `${player.nickname}: ${player.score}`;
    board.appendChild(playerElement);
  });
};

export const handlePlayerUpdate = ({ sockets }) => addPlayers(sockets);
export const handleGameStarted = () => {
  notif.innerText = "";
  disableCanvas();
  hideControls();
  enableChat();
};
export const handleLeaderNotif = ({ word }) => {
  enableCanvas();
  showControls();
  disableChat();
  notif.innerText = "";
  notif.innerText = `You are the Leader. Paint ${word}`;
};
export const handleGameEnded = () => {
  notif.innerText = "Game Ended";
  disableCanvas();
  hideControls();
  resetCanvas();
};
export const handleStarting = () => {
  notif.innerText = "Game will start soon..";
};
