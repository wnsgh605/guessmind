import { chooseWord } from "../words.js";
import events from "./events.js";

let sockets = [];
let inProgress = false;
let word = null;
let leader = null;
let prevLeader = null;
let timeout = null;

const chooseLeader = () => {
  if (prevLeader) {
    while (leader === prevLeader) {
      leader = sockets[Math.floor(Math.random() * sockets.length)];
    }
  } else {
    leader = sockets[Math.floor(Math.random() * sockets.length)];
  }
  return leader;
};

const socketController = (socket, io) => {
  const broadcast = (event, data) => socket.broadcast.emit(event, data);
  const superBroadcast = (event, data) => io.emit(event, data);
  const sendPlayerUpdate = () =>
    superBroadcast(events.playerUpdate, { sockets });
  const startGame = () => {
    if (inProgress === false) {
      inProgress = true;
      leader = chooseLeader();
      prevLeader = leader;
      word = chooseWord();
      superBroadcast(events.starting);
      setTimeout(() => {
        superBroadcast(events.gameStarted);
        io.to(leader.id).emit(events.leaderNotif, { word });
        timeout = setTimeout(() => {
          endGame();
        }, 30000);
      }, 3000);
    }
  };
  const endGame = () => {
    inProgress = false;
    superBroadcast(events.gameEnded);
    if (timeout) {
      clearTimeout(timeout);
    }
    if (sockets.length >= 2) {
      setTimeout(() => {
        startGame();
      }, 2000);
    }
  };
  const addPoints = (id) => {
    sockets = sockets.map((socket) => {
      if (socket.id === id) {
        socket.score += 1;
      }
      return socket;
    });
    sendPlayerUpdate();
    endGame();
  };

  socket.on(events.setNickname, ({ nickname }) => {
    socket.nickname = nickname;
    sockets.push({ id: socket.id, score: 0, nickname });
    broadcast(events.newUser, { nickname });
    sendPlayerUpdate();
    if (sockets.length >= 2) {
      startGame();
    }
  });
  socket.on(events.disconnect, () => {
    sockets = sockets.filter((aSocket) => aSocket.nickname !== socket.nickname);
    if (sockets.length === 1) {
      endGame();
    } else if (leader) {
      if (socket.id === leader.id) {
        endGame();
      }
    }
    broadcast(events.disconnected, { nickname: socket.nickname });
    sendPlayerUpdate();
  });
  socket.on(events.sendMessage, ({ message }) => {
    broadcast(events.newMessage, { message, nickname: socket.nickname });
    if (message === word) {
      superBroadcast(events.newMessage, {
        message: `Winner is ${socket.nickname}. The answer was "${word}"`,
        nickname: "Bot",
      });
      addPoints(socket.id);
    }
  });
  socket.on(events.beginPath, ({ x, y }) => {
    broadcast(events.beganPath, { x, y });
  });
  socket.on(events.strokePath, ({ x, y, color }) => {
    broadcast(events.strokedPath, { x, y, color });
  });
  socket.on(events.fill, ({ color }) => {
    broadcast(events.filled, { color });
  });
};

export default socketController;
