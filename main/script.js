let clickCount = 0;


const button = document.getElementById("clickButton");
const clickCountText = document.getElementById("clickCount");


//TC, CPS count
button.addEventListener("click", () => {
    clickCount++;

    clickCountInSecond++;

    clickCountText.textContent = clickCount;
});

//count clicks per second in recent 1s
let clickPerSec = 0;
const clickPerSecText = document.getElementById("clickPerSec");
let clickCountInSecond = 0;

setInterval(() => {
    clickPerSec = clickCountInSecond;
    clickPerSecText.textContent = clickPerSec;

    clickCountInSecond = 0;
}, 1000);