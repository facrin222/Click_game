let clickCount = 0;
let clickPerSec = 0;

const button = document.getElementById("clickButton");
const clickCountText = document.getElementById("clickCount");
const clickPerSecText = document.getElementById("clickPerSec");

let clickTimes = [];

button.addEventListener("click", () => {
    // Total Click 증가
    clickCount++;
    clickCountText.textContent = clickCount;

    // 클릭한 시간 기록
    clickTimes.push(Date.now());
});

setInterval(() => {
    const now = Date.now();

    // 최근 1초 이내의 클릭만 남김
    clickTimes = clickTimes.filter(time => now - time < 1000);

    // 최근 1초간 클릭 횟수
    clickPerSec = clickTimes.length;

    // 화면에 표시
    clickPerSecText.textContent = clickPerSec;
}, 50);
