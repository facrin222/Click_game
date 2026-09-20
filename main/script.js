// ===== Settings =====
// 게임 밸런스나 동작을 바꾸고 싶을 때 여기 값만 수정하면 됨

const UNLOCK_CLICKS = 10;     // 사이드 패널이 열리는 Total Click 기준
const CPS_WINDOW_MS = 1000;   // CPS 계산에 사용할 시간 범위 (1초)
const CPS_UPDATE_MS = 50;     // CPS 화면 갱신 주기


// ===== Game State (게임 상태 값) =====

let clickCount = 0;           // Total Click
let clickTimes = [];          // 최근 클릭 시각 목록 (CPS 계산용)
let panelUnlocked = false;    // 사이드 패널 해금 여부


// ===== DOM Elements (화면 요소 가져오기) =====

const button = document.getElementById("clickButton");
const clickCountText = document.getElementById("clickCount");
const clickPerSecText = document.getElementById("clickPerSec");

const sideTabs = document.querySelectorAll(".side-tab");
const mainTabContents = document.querySelectorAll(".main-tab-content");


// ===== Click Handler =====
// 버튼 클릭 시: Total Click 증가 + 클릭 시각 기록 + 해금 조건 확인

button.addEventListener("click", () => {
    clickCount++;
    clickCountText.textContent = clickCount;

    clickTimes.push(Date.now());

    checkPanelUnlock();
});


// ===== CPS Calculation =====
// 일정 주기마다 최근 1초 이내의 클릭만 남기고, 그 개수를 CPS로 표시

setInterval(() => {
    const now = Date.now();

    clickTimes = clickTimes.filter(time => now - time < CPS_WINDOW_MS);

    const clickPerSec = clickTimes.length;

    // 값이 바뀐 경우에만 화면 갱신 (불필요한 DOM 업데이트 방지)
    if (clickPerSecText.textContent !== String(clickPerSec)) {
        clickPerSecText.textContent = clickPerSec;
    }
}, CPS_UPDATE_MS);


// ===== Side Panel Unlock =====
// Total Click >= 10 이 되면 body에 panel-open 클래스를 붙여서
// 사이드 패널 표시 + 메인 화면을 패널 오른쪽 영역 중앙으로 이동시킴 (CSS 담당)
// 한 번 열리면 계속 유지됨

function checkPanelUnlock() {
    if (panelUnlocked) return;

    if (clickCount >= UNLOCK_CLICKS) {
        panelUnlocked = true;
        document.body.classList.add("panel-open");
    }
}


// ===== Tab Switching =====
// 선택한 탭만 활성화하고, 나머지 탭과 메인 화면은 숨김 처리

function switchTab(targetId) {

    // 사이드 탭: 선택된 탭만 active + "C" 표시
    sideTabs.forEach(tab => {
        const isActive = tab.dataset.tab === targetId;

        tab.classList.toggle("active", isActive);
        tab.querySelector(".tab-current").textContent = isActive ? "C" : "";
    });

    // 메인 화면: 선택된 탭만 표시 (CSS의 .active 규칙으로 show/hide)
    mainTabContents.forEach(content => {
        content.classList.toggle("active", content.id === targetId);
    });
}

sideTabs.forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});
