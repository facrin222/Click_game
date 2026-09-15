let clickCount = 0;

const button = document.getElementById("clickButton");
const clickCountText = document.getElementById("clickCount");

button.addEventListener("click", () => {
    clickCount++;

    clickCountText.textContent = clickCount;
});