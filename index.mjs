import Bird from "./modules/Bird.mjs";
import { isDark } from "./modules/content.mjs";

const TICK_RATE = 30;
const HEIGHT_MP = 1;

const BIRDCOUNT = 30;

const FOOD_BOX = 10;
const FOOD_DISABLED = true;

export let boxes = [];

export let ds = 1;
export let mE = null;
export let canvas;
export let canvasW;
export let canvasH;
export let birds = [];
let food = [];

const spawnBirds = () => {
  for (let i = 0; i < BIRDCOUNT; i++) {
    const x = Math.random() * canvasW;
    const y = Math.random() * canvasH;

    birds.push(new Bird(x, y, i));
  }
};

const updateBirds = () => {
  birds.forEach((bird) => {
    bird.move();
    bird.draw();
  });
};

const spawnBoxes = () => {
  boxes = [];
  const boxCol = document.getElementById("container").children;
  for (const box of boxCol) {
    const { top, left } = box.getBoundingClientRect();
    const width = box.offsetWidth;
    const height = box.offsetHeight;
    boxes.push({ x: left, y: top, h: height, w: width });
  }
};

const spawnFood = (e) => {
  if (FOOD_DISABLED) return;
  const mx = e.layerX;
  const my = e.layerY;

  const image = new Image();
  image.src = "resources/food.png";
  image.id = food.length + "food";
  canvas.appendChild(image);
  const img = document.getElementById(image.id);
  img.style.position = "absolute";
  img.style.left = parseInt(mx - FOOD_BOX / 2) + "px";
  img.style.top = parseInt(my - FOOD_BOX / 2) + "px";
  img.style.width = FOOD_BOX;
  img.style.height = FOOD_BOX;
  img.style.objectFit = "contain";
  img.style.pointerEvents = "none";
  img.style.userSelect = "none";
  img.style.zIndex = -3;

  food.push({
    x: mx,
    y: my,
    xV: 0,
    yV: 0,
    img: img,
  });
};
const handleMouseDown = (e) => {
  const cap = birds.some((bird) => bird.attemptCapture(e.clientX, e.clientY));
  if (!cap) {
    spawnFood(e);
  }
};

const handleTouchMove = (e) => {
  e.preventDefault();
  if (e.touches[0] == null) {
    return;
  }
  mE = e.touches[0];
};

const handleTouchStart = (e) => {
  e.preventDefault();

  const cap = birds.some((bird) =>
    bird.attemptCapture(e.touches[0].clientX, e.touches[0].clientY)
  );
  if (!cap) {
    spawnFood(e.touches[0]);
  }
};

const handleTouchEnd = (e) => {
  e.preventDefault();
  birds.forEach((bird) => bird.release());
};

const handleMouseUp = () => {
  birds.forEach((bird) => bird.release());
};

const handleResize = () => {
  canvas = document.getElementById("canvas");
  ds = Math.min(Math.min(window.innerWidth, window.innerHeight) / 1000, 1.8);

  canvasW = window.innerWidth;
  canvasH = window.innerHeight * HEIGHT_MP;
  if (canvas !== null) {
    canvas.style.height = canvasH.toString();
    canvas.style.width = canvasW.toString();
    canvas.style.maxHeight = canvasH.toString();
    canvas.style.maxWidth = canvasW.toString();
    canvas.style.minHeight = canvasH.toString();
    canvas.style.minWidth = canvasW.toString();
  }

  birds.forEach((bird) => bird.resize());

  spawnBoxes();
};

const drawFood = () => {};

const setup = () => {
  handleResize();
  canvas = document.getElementById("canvas");

  canvasW = window.innerWidth;
  canvasH = window.innerHeight * HEIGHT_MP;
  if (canvas !== null) {
    canvas.style.height = canvasH.toString();
    canvas.style.width = canvasW.toString();
    canvas.style.maxHeight = canvasH.toString();
    canvas.style.maxWidth = canvasW.toString();
    canvas.style.minHeight = canvasH.toString();
    canvas.style.minWidth = canvasW.toString();
  }
  spawnBirds();

  canvas?.addEventListener("mousemove", (e) => (mE = e));
  canvas?.addEventListener("mousedown", handleMouseDown);
  canvas?.addEventListener("mouseup", handleMouseUp);
  canvas?.addEventListener("touchmove", handleTouchMove);
  canvas?.addEventListener("touchstart", handleTouchStart);
  canvas?.addEventListener("touchend", handleTouchEnd);
};

window.onload = setup;
window.onresize = handleResize;

const tick = () => {
  //if (isDark) return;
  updateBirds();
  drawFood();
};

setInterval(tick, TICK_RATE);
