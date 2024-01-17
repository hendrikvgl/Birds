export let contentMode = false;

const handleMainButton = () => {
  const deg = contentMode ? 0 : 360;
  const button = document.getElementById("button");
  button.style.mozTransform = "rotate(" + deg + "deg)";
  button.style.msTransform = "rotate(" + deg + "deg)";
  button.style.oTransform = "rotate(" + deg + "deg)";
  button.style.transform = "rotate(" + deg + "deg)";
  setTimeout(() => {
    contentMode = !contentMode;

    if (contentMode) {
      init();
    } else {
      end();
    }
  }, 600);
};

const init = () => {
  const darkness = document.getElementById("darkness");
  darkness.style.display = "block";
};

const end = () => {
  const darkness = document.getElementById("darkness");
  darkness.style.display = "none";
};

const button = document.getElementById("button");
button.addEventListener("click", handleMainButton);
