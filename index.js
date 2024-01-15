console.log("Hello World");

const TICK_RATE = 30;
const HEIGHT_MP = 2;
const BIRDSPEED = 4;
const BIRD_MAX_MOVE = 1;
const BIRDCOUNT = 30;
const EDGE_ELA_DISTANCE = 60;
const EDGE_ELA_FORCE = 0.08;
const BOX_ELA_DISTANCE = 70;
const BOX_ELA_FORCE = 0.3;
const BIRD_CHAOS = 0.06;
const MOUSE_ELA_DISTANCE = 120;
const MOUSE_ELA_FORCE = 0.25;
const FOOD_BOX = 10;
const BIRD_BOX = 50;
const BIRD_FLOCK_MIN_DIS = 120;
const BIRD_FLOCK_MAX_DIS = 110;
const BIRD_FLOCK_PUSH_FORCE = 0.2;
const BIRD_FLOCK_PULL_FORCE = 0.08;
const BIRD_FLIGHT_SPEED = 0.2;

const BOXES = [
  {
    x: 300,
    y: 700,
    h: 300,
    w: 400,
    c: "red",
  },
  {
    x: 1000,
    y: 900,
    h: 200,
    w: 200,
    c: "red",
  },
];

let mE = null;
let canvas;
let canvasW;
let canvasH;
let gc;
let birds = [];
let images = [];
let food = [];

class Bird {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.xVel = Math.random() * 2 - 1;
    this.yVel = Math.random() * 2 - 1;
    this.img;
    this.id = id;
    this.captured = false;
    this.target = null;
    const image = new Image();
    image.src = "birdAnim.png";
    image.id = id;
    this.keyframe = 0;
    canvas.appendChild(image);
    this.img = document.getElementById(image.id);
    this.img.style.position = "absolute";
    this.img.style.left = this.x - BIRD_BOX / 2 + "px";
    this.img.style.top = this.y - BIRD_BOX / 2 + "px";
    this.img.style.width = BIRD_BOX;
    this.img.style.height = BIRD_BOX;
    this.img.style.objectFit = "none";
    this.img.style.pointerEvents = "none";
    this.img.style.userSelect = "none";
    this.img.style.animationDuration = 1.5;

    this.flight();

    console.log("QUACK");
  }

  flight = () => {
    setInterval(() => {
      this.keyframe +=
        (Math.abs(this.xVel) + Math.abs(this.yVel)) * BIRD_FLIGHT_SPEED;
      this.img.style.objectPosition = `-${
        Math.floor(this.keyframe) * 50
      }px 0px`;

      if (this.keyframe > 3) {
        this.keyframe = 0;
      }
    }, 20);
  };

  draw() {
    const rotDeg =
      (Math.atan2(this.yVel * BIRDSPEED, this.xVel * BIRDSPEED) * 180.0) /
      Math.PI;
    let rotDegNorm;
    if (rotDeg < 0) {
      rotDegNorm = 360 + rotDeg + 90;
    } else {
      rotDegNorm = rotDeg + 90;
    }
    this.img.style.transform = "rotate(" + rotDegNorm + "deg)";
    this.img.style.left = this.x - BIRD_BOX / 2 + "px";
    this.img.style.top = this.y - BIRD_BOX / 2 + "px";
  }

  avoidEdges() {
    if (this.x < EDGE_ELA_DISTANCE) {
      this.xVel += Math.abs(EDGE_ELA_DISTANCE / this.x) * EDGE_ELA_FORCE;
    } else if (this.x > canvasW - EDGE_ELA_DISTANCE) {
      this.xVel +=
        -(EDGE_ELA_DISTANCE / Math.abs(canvasW - this.x)) * EDGE_ELA_FORCE;
    }
    if (this.y < EDGE_ELA_DISTANCE) {
      this.yVel += (EDGE_ELA_DISTANCE / this.y) * EDGE_ELA_FORCE;
    } else if (this.y > canvasH - EDGE_ELA_DISTANCE) {
      this.yVel +=
        -(EDGE_ELA_DISTANCE / Math.abs(canvasH - this.y)) * EDGE_ELA_FORCE;
    }
  }

  avoidBoxes() {
    BOXES.forEach(({ x, y, w, h }) => {
      if (
        this.x > x - BOX_ELA_DISTANCE &&
        this.x < x + w + BOX_ELA_DISTANCE &&
        this.y > y - BOX_ELA_DISTANCE &&
        this.y < y + h + BOX_ELA_DISTANCE
      ) {
        if (this.x < x + w / 2) {
          this.xVel +=
            -Math.abs((this.x + BOX_ELA_DISTANCE - x) / BOX_ELA_DISTANCE) *
            BOX_ELA_FORCE;
        } else {
          this.xVel +=
            (Math.abs(x + w - this.x + BOX_ELA_DISTANCE) / BOX_ELA_DISTANCE) *
            BOX_ELA_FORCE;
        }
        if (this.y < y + h / 2) {
          this.yVel +=
            -(Math.abs(this.y + BOX_ELA_DISTANCE - y) / BOX_ELA_DISTANCE) *
            BOX_ELA_FORCE;
        } else {
          this.yVel +=
            (Math.abs(y + h + BOX_ELA_DISTANCE - this.y) / BOX_ELA_DISTANCE) *
            BOX_ELA_FORCE;
        }
      }
    });
  }

  getClosestBird(onlyNonTargeted) {
    const closest = {
      bird: null,
      distance: Number.MAX_SAFE_INTEGER,
    };
    birds.forEach((bird) => {
      if (bird.id !== this.id && (!onlyNonTargeted || bird.target !== this)) {
        const dis = Math.abs(bird.x - this.x) + Math.abs(bird.y - this.y);
        if (dis < closest.distance) {
          closest.bird = bird;
          closest.distance = dis;
        }
      }
    });

    return closest;
  }

  flock() {
    const { distance, bird } = this.getClosestBird(false);
    if (distance < BIRD_FLOCK_MIN_DIS) {
      this.xVel +=
        ((this.x - bird.x) / BIRD_FLOCK_MIN_DIS) * BIRD_FLOCK_PUSH_FORCE;
      this.yVel +=
        ((this.y - bird.y) / BIRD_FLOCK_MIN_DIS) * BIRD_FLOCK_PUSH_FORCE;
      this.target = null;
      return;
    }
    const { distance: disNT, bird: birdNT } = this.getClosestBird(true);
    this.target = birdNT;
    if (disNT > BIRD_FLOCK_MAX_DIS) {
      this.xVel +=
        -((this.x - birdNT.x) / BIRD_FLOCK_MAX_DIS) * BIRD_FLOCK_PULL_FORCE;
      this.yVel +=
        -((this.y - birdNT.y) / BIRD_FLOCK_MAX_DIS) * BIRD_FLOCK_PULL_FORCE;
    }
  }

  chaos() {
    const ran = Math.random() * 2 - 1;
    this.xEdge += ran * BIRD_CHAOS;
    this.yEdge += -ran * BIRD_CHAOS;
  }

  avoidMouse() {
    if (mE == null) {
      return;
    }

    const mx = mE.layerX;
    const my = mE.layerY;

    if (
      Math.abs(this.x - mx) < MOUSE_ELA_DISTANCE &&
      Math.abs(this.y - my) < MOUSE_ELA_DISTANCE
    ) {
      this.xVel += ((this.x - mx) / MOUSE_ELA_DISTANCE) * MOUSE_ELA_FORCE;
      this.yVel += ((this.y - my) / MOUSE_ELA_DISTANCE) * MOUSE_ELA_FORCE;
    }
  }

  limitMove() {
    this.xVel =
      this.xVel > 0
        ? Math.min(this.xVel, BIRD_MAX_MOVE)
        : Math.max(this.xVel, -BIRD_MAX_MOVE);
    this.yVel =
      this.yVel > 0
        ? Math.min(this.yVel, BIRD_MAX_MOVE)
        : Math.max(this.yVel, -BIRD_MAX_MOVE);
  }

  move() {
    if (this.captured) {
      this.x = mE.layerX;
      this.y = mE.layerY;
      return;
    }
    this.avoidEdges();
    this.avoidMouse();
    this.avoidBoxes();
    this.flock();
    //this.chaos();
    this.limitMove();
    this.x += this.xVel * BIRDSPEED;
    this.y += this.yVel * BIRDSPEED;
  }

  attemptCapture(x, y) {
    if (Math.abs(this.x - x) < BIRD_BOX && Math.abs(this.y - y) < BIRD_BOX) {
      console.log("Selected Bird" + this.id);
      this.captured = true;
    }
    return this.captured;
  }

  release() {
    this.captured = false;
  }
}

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
  BOXES.forEach(({ x, y, h, w, c }) => {
    var div = document.createElement("div");

    document.getElementById("canvas").appendChild(div);

    div.style.position = "absolute";
    div.style.left = x;
    div.style.top = y;
    div.style.width = w;
    div.style.height = h;
    div.style.borderColor = c;
    div.style.borderStyle = "solid";
  });
};

const spawnFood = (e) => {
  const mx = e.layerX;
  const my = e.layerY;

  const image = new Image();
  image.src = "food.png";
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

const handleMouseUp = () => {
  birds.forEach((bird) => bird.release());
};

const drawFood = () => {};

const setup = () => {
  canvas = document.getElementById("canvas");
  canvasW = window.innerWidth;
  canvasH = window.innerHeight * HEIGHT_MP;
  if (canvas !== null) {
    canvas.style.height = canvasH.toString();
    canvas.style.width = canvasW.toString();
  }
  console.log(window.innerHeight, window.innerWidth);
  spawnBirds();
  spawnBoxes();

  canvas?.addEventListener("mousemove", (e) => (mE = e));
  canvas?.addEventListener("mousedown", handleMouseDown);
  canvas?.addEventListener("mouseup", handleMouseUp);
};

window.onload = setup;

const tick = () => {
  updateBirds();
  drawFood();
};

setInterval(tick, TICK_RATE);
