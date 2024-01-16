export let contentMode = false;

const handleMainButton = () => {
  contentMode = !contentMode;

  const deg = contentMode ? 360 : 0;
  const button = document.getElementById("button");
  button.style.mozTransform = "rotate(" + deg + "deg)";
  button.style.msTransform = "rotate(" + deg + "deg)";
  button.style.oTransform = "rotate(" + deg + "deg)";
  button.style.transform = "rotate(" + deg + "deg)";

  if (contentMode) {
    init();
  } else {
    end();
  }
};

const init = () => {
  const darkness = document.getElementById("darkness");
  darkness.style.display = "block";
};

const end = () => {
  const darkness = document.getElementById("darkness");
  darkness.style.display = "none";
};

document.getElementById("button").addEventListener("click", handleMainButton);
