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

// ===== Side Panel Module =====

const sidePanel = document.getElementById("sidePanel");
const sideTabs = document.querySelectorAll(".side-tab");
const sideTabContents = document.querySelectorAll(".side-tab-content");


// TC가 10을 넘었을 때 Side Panel 해금
button.addEventListener("click", () => {
    if (clickCount >= 10) {
        sidePanel.style.display = "block";
    }
});


// Tab 전환
sideTabs.forEach(tab => {
    tab.addEventListener("click", () => {

        // 모든 탭 비활성화
        sideTabs.forEach(tab => {
            tab.classList.remove("active");

            const current = tab.querySelector(".tab-current");
            current.textContent = "";
        });

        // 클릭한 탭 활성화
        tab.classList.add("active");

        const current = tab.querySelector(".tab-current");
        current.textContent = "C";


        // 모든 내용 숨김
        sideTabContents.forEach(content => {
            content.classList.remove("active");
        });


        // 선택한 내용 표시
        const targetId = tab.dataset.tab;
        const targetContent = document.getElementById(targetId);

        targetContent.classList.add("active");
    });
});