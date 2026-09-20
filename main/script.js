// ===== Settings =====
// 게임 밸런스나 동작을 바꾸고 싶을 때 여기 값만 수정하면 됨

const UNLOCK_CLICKS = 10;     // 사이드 패널이 열리는 Total Click 기준
const CPS_WINDOW_MS = 1000;   // CPS 계산에 사용할 시간 범위 (1초)
const CPS_UPDATE_MS = 50;     // CPS 화면 갱신 주기
const AUTO_SAVE_MS = 15000;   // 자동 저장 주기 (15초)
const MESSAGE_MS = 2500;      // Options 메시지 표시 시간
const SAVE_KEY = "justClickInCircle_save";  // 브라우저 저장소에 쓰는 이름표


// ===== Game State (게임 상태 값) =====

let clickCount = 0;           // Total Click
let clickTimes = [];          // 최근 클릭 시각 목록 (CPS 계산용, 저장 안 함)
let panelUnlocked = false;    // 사이드 패널 해금 여부 (저장 안 하고 clickCount로 다시 계산)
let currentTab = "clickMain"; // 현재 열려 있는 탭

let autoSaveTimer = null;     // 자동 저장 타이머 ID
let messageTimer = null;      // 메시지 숨김 타이머 ID


// ===== DOM Elements (화면 요소 가져오기) =====

const button = document.getElementById("clickButton");
const clickCountText = document.getElementById("clickCount");
const clickPerSecText = document.getElementById("clickPerSec");

const sideTabs = document.querySelectorAll(".side-tab");
const mainTabContents = document.querySelectorAll(".main-tab-content");

const exportButton = document.getElementById("exportButton");
const importButton = document.getElementById("importButton");
const saveButton = document.getElementById("saveButton");
const dataTextarea = document.getElementById("dataTextarea");
const optionMessage = document.getElementById("optionMessage");


// ===== Save Data =====
// 저장/내보내기에 공통으로 쓰는 데이터 묶음
// 저장할 항목이 늘어나면 getSaveData()와 applyData()에 항목을 추가하면 됨

function getSaveData() {
    return {
        clickCount: clickCount,
        currentTab: currentTab
    };
}

// 데이터를 게임 상태와 화면에 반영
// restoreTab: true면 저장된 탭으로 이동 (불러오기), false면 현재 탭 유지 (Import)
// 데이터가 올바르지 않으면 false를 반환하고 아무것도 바꾸지 않음
function applyData(data, restoreTab) {

    // 값 검사 (숫자이고 0 이상인지)
    if (!data || !Number.isFinite(data.clickCount) || data.clickCount < 0) {
        return false;
    }

    clickCount = Math.floor(data.clickCount);
    clickCountText.textContent = clickCount;

    // 해금 상태를 clickCount 기준으로 다시 계산 (Import로 값이 줄어든 경우도 처리)
    panelUnlocked = false;
    document.body.classList.remove("panel-open");
    checkPanelUnlock();

    if (!panelUnlocked) {
        // 패널이 닫혔다면 볼 수 있는 화면은 Click 탭뿐
        switchTab("clickMain");
    } else if (restoreTab && isValidTab(data.currentTab)) {
        switchTab(data.currentTab);
    }

    return true;
}

// 존재하는 탭 id인지 확인
function isValidTab(tabId) {
    return Array.from(mainTabContents).some(content => content.id === tabId);
}


// ===== Save / Load =====
// localStorage: 브라우저에 문자열로 저장되는 공간 (새로고침, 창 닫기 후에도 유지됨)

// 현재 상태를 저장
function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(getSaveData()));
    } catch (error) {
        console.error("저장 실패:", error);
    }
}

// 저장된 데이터를 불러와 반영 (페이지 시작 시 1번 실행)
function loadGame() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;  // 저장 데이터가 없으면 새 게임으로 시작

        applyData(JSON.parse(raw), true);
    } catch (error) {
        console.error("불러오기 실패:", error);
    }
}

// 저장 데이터 삭제 후 새로고침 (나중에 초기화 버튼에 연결 가능)
function resetGame() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
}


// ===== Auto Save =====
// 15초마다 자동 저장. 수동 저장(SAVE)이나 Import 시 호출하면
// 타이머를 지우고 새로 시작하므로 다음 자동 저장이 "지금부터 15초 뒤"로 갱신됨

function startAutoSave() {
    clearInterval(autoSaveTimer);
    autoSaveTimer = setInterval(saveGame, AUTO_SAVE_MS);
}

// 즉시 저장 + 자동 저장 주기 갱신
function saveNow() {
    saveGame();
    startAutoSave();
}


// ===== Options: Message =====
// Options 탭 하단에 잠깐 표시되는 결과 메시지

function showMessage(text) {
    optionMessage.textContent = text;

    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
        optionMessage.textContent = "";
    }, MESSAGE_MS);
}


// ===== Options: Export / Import =====

// 클립보드에 복사 (실패하면 false)
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // 구형 방식으로 한 번 더 시도
        try {
            dataTextarea.select();
            return document.execCommand("copy");
        } catch (fallbackError) {
            return false;
        }
    }
}

// EXPORT: 현재 데이터를 JSON 문자열로 입력창에 표시하고 복사
exportButton.addEventListener("click", async () => {
    const json = JSON.stringify(getSaveData());

    dataTextarea.value = json;

    const copied = await copyToClipboard(json);
    showMessage(copied ? "Exported & copied" : "Exported (copy manually)");
});

// IMPORT: 입력창의 JSON 문자열을 읽어 적용
importButton.addEventListener("click", () => {
    let data;

    try {
        data = JSON.parse(dataTextarea.value);
    } catch (error) {
        showMessage("Invalid JSON");
        return;
    }

    if (!applyData(data, false)) {
        showMessage("Invalid data");
        return;
    }

    saveNow();  // 불러온 데이터를 바로 저장
    showMessage("Imported");
});



// ===== Save Button =====
// 사이드 패널 옆의 독립 SAVE 버튼: 즉시 저장 + 자동 저장 주기 갱신
// 저장되면 버튼이 잠깐 강조되어 어느 탭에서든 저장됐음을 알 수 있음

let saveFlashTimer = null;

saveButton.addEventListener("click", () => {
    saveNow();

    saveButton.classList.add("saved");
    clearTimeout(saveFlashTimer);
    saveFlashTimer = setTimeout(() => {
        saveButton.classList.remove("saved");
    }, 500);

    showMessage("Saved");
});


// ===== Click Handler =====
// 버튼 클릭 시: Total Click 증가 + 클릭 시각 기록 + 해금 조건 확인
// (저장은 자동 저장 타이머가 담당)

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
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});


// ===== Init =====
// 모든 함수와 요소가 준비된 뒤, 마지막에 저장 데이터를 불러오고 자동 저장 시작

loadGame();
startAutoSave();
