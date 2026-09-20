// ===== Settings =====
// 게임 밸런스나 동작을 바꾸고 싶을 때 여기 값만 수정하면 됨

const UNLOCK_CLICKS = 10;     // 사이드 패널이 열리는 Total Click 기준
const CPS_WINDOW_MS = 1000;   // CPS 계산에 사용할 시간 범위 (1초)
const CPS_UPDATE_MS = 50;     // CPS 화면 갱신 주기
const SAVE_KEY = "justClickInCircle_save";  // 브라우저 저장소에 쓰는 이름표


// ===== Game State (게임 상태 값) =====

let clickCount = 0;           // Total Click
let clickTimes = [];          // 최근 클릭 시각 목록 (CPS 계산용, 저장 안 함)
let panelUnlocked = false;    // 사이드 패널 해금 여부 (저장 안 하고 clickCount로 다시 계산)
let currentTab = "clickMain"; // 현재 열려 있는 탭


// ===== DOM Elements (화면 요소 가져오기) =====

const button = document.getElementById("clickButton");
const clickCountText = document.getElementById("clickCount");
const clickPerSecText = document.getElementById("clickPerSec");

const sideTabs = document.querySelectorAll(".side-tab");
const mainTabContents = document.querySelectorAll(".main-tab-content");


// ===== Save / Load =====
// localStorage: 브라우저에 문자열로 저장되는 공간 (새로고침, 창 닫기 후에도 유지됨)
// 저장할 값들을 객체로 묶고 JSON 문자열로 바꿔서 저장함

// 현재 상태를 저장
function saveGame() {
    const data = {
        clickCount: clickCount,
        currentTab: currentTab
    };

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("저장 실패:", error);
    }
}

// 저장된 데이터를 불러와 상태와 화면에 반영 (페이지 시작 시 1번 실행)
function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;  // 저장 데이터가 없으면 새 게임으로 시작

        const data = JSON.parse(raw);

        // 값이 숫자인지 확인한 뒤 복원 (데이터가 깨졌을 때 대비)
        if (Number.isFinite(data.clickCount)) {
            clickCount = data.clickCount;
            clickCountText.textContent = clickCount;
        }

        // 해금 조건을 다시 확인해서 사이드 패널 복원
        checkPanelUnlock();

        // 패널이 열려 있는 경우에만 저장된 탭으로 이동
        if (panelUnlocked && typeof data.currentTab === "string") {
            switchTab(data.currentTab);
        }
    } catch (error) {
        console.error("불러오기 실패:", error);
    }
}

// 저장 데이터 삭제 후 새로고침 (나중에 Options의 초기화 버튼에 연결 가능)
function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
}


// ===== Click Handler =====
// 버튼 클릭 시: Total Click 증가 + 클릭 시각 기록 + 해금 조건 확인 + 저장

button.addEventListener("click", () => {
    clickCount++;
    clickCountText.textContent = clickCount;

    clickTimes.push(Date.now());

    checkPanelUnlock();
    saveGame();
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
    currentTab = targetId;

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
    tab.addEventListener("click", () => {
        switchTab(tab.dataset.tab);
        saveGame();
    });
});


// ===== Init =====
// 모든 함수와 요소가 준비된 뒤, 마지막에 저장 데이터를 불러옴

loadGame();
