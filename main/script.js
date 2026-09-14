let clickCount = 0;

const button = document.getElementById("clickButton");

button.addEventListener("click", () => {
    clickCount++;

    button.textContent = clickCount;
});