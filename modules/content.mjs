export let contentMode = false;
export let isDark = false;

let darkTimer;

const handleMainButton = () => {
  const deg = contentMode ? 0 : 360;
  const button = document.getElementById("button");
  const screen = document.getElementById("screen");
  button.style.mozTransform = "rotate(" + deg + "deg)";
  button.style.msTransform = "rotate(" + deg + "deg)";
  button.style.oTransform = "rotate(" + deg + "deg)";
  button.style.transform = "rotate(" + deg + "deg)";
  contentMode = !contentMode;
  if (contentMode) {
    screen.classList.add("screendown");
  } else {
    const content = document.getElementById("screencontent");
    content.style.display = "none";
    clearTimeout(darkTimer);
    screen.classList.remove("screendown");
  }
};

const dark = () => {
  isDark = true;
  const darkness = document.getElementById("darkness");
  darkness.style.display = "block";
  const sDarkness = document.getElementById("screendarkness");
  sDarkness.style.display = "block";
  darkTimer = setTimeout(() => {
    const content = document.getElementById("screencontent");
    content.style.display = "block";
  }, 600);
};

const light = () => {
  isDark = false;
  const darkness = document.getElementById("darkness");
  darkness.style.display = "none";
  const sDarkness = document.getElementById("screendarkness");
  sDarkness.style.display = "none";
};

const button = document.getElementById("button");
button.addEventListener("click", handleMainButton);
const screen = document.getElementById("screen");
screen.ontransitionend = () => {
  setTimeout(() => {
    if (contentMode) {
      dark();
    } else {
      light();
    }
  }, 200);
};
