const widgetBox = document.getElementById("widget-box");
const grid = document.getElementById("mood-grid");

/* =========================
   BUILDER UI ELEMENTS
========================= */
const themeToggle = document.getElementById("themeToggle");
const themeOptions = document.getElementById("themeOptions");

const fontToggle = document.getElementById("fontToggle");
const fontOptions = document.getElementById("fontOptions");

const copyLinkBtn = document.getElementById("copyLinkBtn");
const copyMessage = document.getElementById("copyMessage");

const usageTip = document.getElementById("usageTip");

const params = new URLSearchParams(window.location.search);
const isEmbed = params.get("embed") === "true";

/* =========================
   EMBED MODE
========================= */
if (isEmbed) {
  document.querySelector(".builder-ui")?.style.setProperty("display", "none");
}

/* =========================
   STATE SYSTEM
========================= */
function getState() {
  return {
    theme: params.get("theme") || localStorage.getItem("userTheme") || "pink",
    font: params.get("font") || localStorage.getItem("userFont") || "default"
  };
}

/* =========================
   APPLY THEME
========================= */
function applyTheme(theme) {
  widgetBox.className = `widget ${theme}`;
  localStorage.setItem("userTheme", theme);
}

/* =========================
   APPLY FONT
========================= */
function applyFont(font) {
  let fontFamily = "'Satoshi', sans-serif";

  if (font === "serif") fontFamily = "Georgia, serif";
  if (font === "mono") fontFamily = "ui-monospace, monospace";

  widgetBox.style.fontFamily = fontFamily;
  localStorage.setItem("userFont", font);
}

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  const state = getState();

  applyTheme(state.theme);
  applyFont(state.font);

  createGrid();
});

/* =========================
   THEME UI
========================= */
themeToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  themeOptions.classList.toggle("hidden");
});

themeOptions?.querySelectorAll(".theme-circle").forEach(circle => {
  circle.addEventListener("click", () => {
    applyTheme(circle.dataset.theme);
    themeOptions.classList.add("hidden");
  });
});

/* =========================
   FONT UI
========================= */
fontToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  fontOptions.classList.toggle("hidden");
});

fontOptions?.querySelectorAll(".font-option").forEach(opt => {
  opt.addEventListener("click", () => {
    applyFont(opt.dataset.font);
    fontOptions.classList.add("hidden");
  });
});

/* =========================
   MOOD SYSTEM
========================= */
const moods = [
  { color: '#FEF1C8', label: 'good' },
  { color: '#FFA7A6', label: 'loved' },
  { color: '#C3C2D5', label: 'rough' },
  { color: '#C4DADE', label: 'calm' },
  { color: '#93B0AC', label: 'social' },
  { color: '#DCC3B4', label: 'hectic' },
  { color: '#E7D9CC', label: 'meh' },
  { color: '#FFA5C5', label: 'awesome' }
];

const days = ["sun","mon","tue","wed","thu","fri","sat"];

let moodLog = JSON.parse(localStorage.getItem("mood-log")) || {};
let moodMenu = null;

/* =========================
   GRID BUILD
========================= */
function createGrid() {
  grid.innerHTML = "";

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const key = date.toISOString().split("T")[0];

    const cell = document.createElement("div");
    cell.className = "day-cell";

    const label = document.createElement("div");
    label.className = "day-label";
    label.textContent = `${days[i]} ${date.getMonth()+1}/${date.getDate()}`;

    const content = document.createElement("div");
    content.className = "day-content";

    cell.appendChild(label);
    cell.appendChild(content);

    if (moodLog[key]) {
      content.style.backgroundColor = moodLog[key].color;
      content.textContent = moodLog[key].label;
    } else {
      content.textContent = "+";
    }

    cell.addEventListener("click", (e) => {
      e.stopPropagation();
      openMoodMenu(cell, content, key);
    });

    grid.appendChild(cell);
  }
}

/* =========================
   MOOD MENU
========================= */
function openMoodMenu(cell, content, key) {
  if (moodMenu) moodMenu.remove();

  moodMenu = document.createElement("div");
  moodMenu.className = "mood-menu";

  moods.forEach(mood => {
    const btn = document.createElement("div");
    btn.className = "mood-option";

    const dot = document.createElement("div");
    dot.className = "mood-color";
    dot.style.background = mood.color;

    const label = document.createElement("div");
    label.textContent = mood.label;

    btn.appendChild(dot);
    btn.appendChild(label);

    btn.onclick = () => {
      moodLog[key] = mood;
      localStorage.setItem("mood-log", JSON.stringify(moodLog));

      content.style.backgroundColor = mood.color;
      content.textContent = mood.label;

      moodMenu.remove();
    };

    moodMenu.appendChild(btn);
  });

  widgetBox.appendChild(moodMenu);
}

/* =========================
   CLOSE MENUS
========================= */
document.addEventListener("click", () => {
  if (moodMenu) moodMenu.remove();
  themeOptions?.classList.add("hidden");
  fontOptions?.classList.add("hidden");
});

/* =========================
   COPY LINK (FULL SYSTEM)
========================= */
copyLinkBtn?.addEventListener("click", async () => {
  const theme = localStorage.getItem("userTheme") || "pink";
  const font = localStorage.getItem("userFont") || "default";

  const url =
    `${location.origin}${location.pathname}` +
    `?theme=${theme}` +
    `&font=${font}` +
    `&embed=true`;

  try {
    await navigator.clipboard.writeText(url);

    copyMessage.classList.add("hidden");
    copyMessage.classList.remove("show");

    void copyMessage.offsetWidth;

    copyMessage.classList.remove("hidden");
    copyMessage.classList.add("show");

    clearTimeout(window.__copyTimer);
    window.__copyTimer = setTimeout(() => {
      copyMessage.classList.add("hidden");
      copyMessage.classList.remove("show");
    }, 1800);

  } catch (err) {
    console.error("copy failed", err);
  }
});
