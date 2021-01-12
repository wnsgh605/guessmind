import { getSocket } from "./sockets";

const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");
const colors = document.getElementsByClassName("jsColor");
const mode = document.getElementById("jsMode");
const controls = document.getElementById("jsControls");

canvas.width = 600;
canvas.height = 600;

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = "#2c2c2c";
ctx.fillStyle = "#2c2c2c";
ctx.lineWidth = 2.5;

let painting = false;
let fill = false;

const beginPath = (x, y) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const strokePath = (x, y, color = null) => {
  let currentColor = ctx.strokeStyle;
  if (color !== null) {
    ctx.strokeStyle = color;
  }
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.strokeStyle = currentColor;
};

function onMouseMove(event) {
  const x = event.offsetX;
  const y = event.offsetY;
  if (!painting) {
    beginPath(x, y);
    getSocket().emit(window.events.beginPath, { x, y });
  } else {
    strokePath(x, y);
    getSocket().emit(window.events.strokePath, {
      x,
      y,
      color: ctx.strokeStyle,
    });
  }
}

function startPainting() {
  painting = true;
  document.addEventListener("mouseup", stopPainting);
}

function stopPainting() {
  painting = false;
}

function changeColor(event) {
  ctx.strokeStyle = event.target.style.backgroundColor;
  ctx.fillStyle = event.target.style.backgroundColor;
}

function handleMode() {
  if (fill === true) {
    fill = false;
    mode.innerHTML = "Fill";
  } else {
    fill = true;
    mode.innerHTML = "Draw";
  }
}

const fillCanv = (color = null) => {
  let currentColor = ctx.fillStyle;
  if (color !== null) {
    ctx.fillStyle = color;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = currentColor;
};

function fillCanvas() {
  if (fill) {
    fillCanv();
    getSocket().emit(window.events.fill, { color: ctx.strokeStyle });
  }
}

function noShow(event) {
  event.preventDefault();
}

Array.from(colors).forEach((color) =>
  color.addEventListener("click", changeColor)
);

if (mode) {
  mode.addEventListener("click", handleMode);
}

export const handleBeganPath = ({ x, y }) => beginPath(x, y);
export const handleStrokedPath = ({ x, y, color }) => strokePath(x, y, color);
export const handleFilled = ({ color }) => fillCanv(color);
export const disableCanvas = () => {
  canvas.removeEventListener("mousemove", onMouseMove);
  canvas.removeEventListener("mousedown", startPainting);
  canvas.removeEventListener("mouseup", stopPainting);
  canvas.removeEventListener("click", fillCanvas);
};
export const enableCanvas = () => {
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", startPainting);
  canvas.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("click", fillCanvas);
};
export const hideControls = () => (controls.style.display = "none");
export const showControls = () => (controls.style.display = "flex");
export const resetCanvas = () => fillCanv("#fff");

if (canvas) {
  canvas.addEventListener("contextmenu", noShow);
  hideControls();
}
