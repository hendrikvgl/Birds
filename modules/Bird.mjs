import { canvas, birds, boxes, canvasW, canvasH, mE, ds } from "../index.mjs";
import { isDark } from "./content.mjs";

let BIRD_FLOCK_MIN_DIS = 120;
let BIRD_FLOCK_MAX_DIS = 110;
let BIRD_FLOCK_PUSH_FORCE = 0.2;
let BIRD_FLOCK_PULL_FORCE = 0.08;
let BIRD_FLIGHT_SPEED = 0.2;
let EDGE_ELA_DISTANCE = 60;
let EDGE_ELA_FORCE = 0.08;
let BOX_ELA_DISTANCE = 30;
let BOX_ELA_FORCE = 0.5;
let MOUSE_ELA_DISTANCE = 150;
let MOUSE_ELA_FORCE = 0.4;
let BIRDSPEED = 4;
let BIRD_MAX_MOVE = 1;
let BIRD_BOX = 50;

const BIRD_CHAOS = 0.06;

export default class Bird {
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
    image.src = "resources/birdAnim.png";
    image.id = id;
    this.keyframe = 0;
    canvas.appendChild(image);

    this.img = document.getElementById(image.id);
    this.img.style.position = "absolute";
    this.img.style.objectFit = "cover";
    this.img.style.pointerEvents = "none";
    this.img.style.userSelect = "none";
    this.img.style.animationDuration = 1.5;
    this.resize();

    this.flight();

    console.log("QUACK");
  }

  resize() {
    const factor = ds;
    BIRD_FLOCK_MIN_DIS = 120 * factor;
    BIRD_FLOCK_MAX_DIS = 110 * factor;
    BIRD_FLOCK_PUSH_FORCE = 0.2 * factor;
    BIRD_FLOCK_PULL_FORCE = 0.08 * factor;
    BIRD_FLIGHT_SPEED = 0.2 * factor;
    EDGE_ELA_DISTANCE = 60 * factor;
    EDGE_ELA_FORCE = 0.08 * factor;
    BOX_ELA_DISTANCE = 30 * factor;
    BOX_ELA_FORCE = 0.5 * factor;
    MOUSE_ELA_DISTANCE = 120 * factor;
    MOUSE_ELA_FORCE = 0.25 * factor;
    BIRDSPEED = 4 * factor;
    BIRD_MAX_MOVE = 1;
    BIRD_BOX = 50 * ds;

    this.img = document.getElementById(this.img.id);
    this.img.style.left = this.x - BIRD_BOX / 2 + "px";
    this.img.style.top = this.y - BIRD_BOX / 2 + "px";
    this.img.style.width = BIRD_BOX;
    this.img.style.height = BIRD_BOX;
  }

  flight = () => {
    setInterval(() => {
      //if (isDark) return;
      this.keyframe +=
        (Math.abs(this.xVel) + Math.abs(this.yVel)) * BIRD_FLIGHT_SPEED;
      this.img.style.objectPosition = `-${
        Math.floor(this.keyframe) * BIRD_BOX
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
    boxes.forEach(({ x, y, w, h }) => {
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

    const mx = mE.clientX;
    const my = mE.clientY;

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
    if (this.captured && mE !== null) {
      this.x = mE.clientX;
      this.y = mE.clientY;
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
