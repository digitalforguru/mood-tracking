document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
  ========================= */
  const widgetBox = document.getElementById("widget-box");
  const grid = document.getElementById("mood-grid");

  const themeSelector = document.querySelector(".theme-selector");
  const themeOptions = document.querySelector(".theme-options");
  const currentThemeCircle = document.querySelector(".current-theme-circle");

  const fontToggle = document.getElementById("fontToggle");
  const fontOptions = document.getElementById("fontOptions");
  const fontChoices = document.querySelectorAll(".font-option");

  const resetButton = document.getElementById("reset-button");
  const resetPopup = document.getElementById("reset-popup");
  const confirmReset = document.getElementById("confirm-reset");
  const cancelReset = document.getElementById("cancel-reset");

  const viewLogBtn = document.getElementById("view-log-btn");
  const moodLogPopup = document.getElementById("mood-log-popup");
  const logEntriesDiv = document.getElementById("log-entries");
  const closeLogBtn = document.getElementById("close-log-btn");

  const copyBtn = document.getElementById("copyLinkBtn");
  const copyMsg = document.getElementById("copyMessage");

  /* =========================
     STATE (URL BASED)
  ========================= */
  const params = new URLSearchParams(window.location.search);

  const state = {
    theme: params.get("theme") || "pink",
    font: params.get("font") || "default",
    embed: params.get("embed") === "true"
  };

  /* =========================
     THEMES
  ========================= */
  const themes = {
    pink: "#ffe7f5",
    green: "#daece1",
    lavender: "#f6e5fc",
    blue: "#dceaf5"
  };

  const moods = [
    { color: "#FEF1C8", label: "good" },
    { color: "#FFA7A6", label: "loved" },
    { color: "#C3C2D5", label: "rough" },
    { color: "#C4DADE", label: "calm" },
    { color: "#93B0AC", label: "social" },
    { color: "#DCC3B4", label: "hectic" },
    { color: "#E7D9CC", label: "meh" },
    { color: "#FFA5C5", label: "awesome" }
  ];

  const days = ["sun","mon","tue","wed","thu","fri","sat"];

  let moodLog = JSON.parse(localStorage.getItem("mood-log")) || {};
  let moodMenu = null;

  /* =========================
     APPLY THEME
  ========================= */
  function applyTheme(theme) {
    widgetBox.className = `widget theme-${theme}`;
    if (currentThemeCircle) {
      currentThemeCircle.style.backgroundColor = themes[theme];
    }
  }

  /* =========================
     APPLY FONT (SCOPED ONLY)
  ========================= */
  function applyFont(font) {
    let fontFamily =
      font === "serif"
        ? "Georgia, serif"
        : font === "mono"
        ? "ui-monospace, monospace"
        : "'Work Sans', sans-serif";

    widgetBox.style.fontFamily = fontFamily;
  }

  /* =========================
     WEEK GENERATION
  ========================= */
  function getWeekDates() {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      return {
        day: days[i],
        key: d.toISOString().split("T")[0]
      };
    });
  }

  /* =========================
     MOOD SAVE
  ========================= */
  function saveMood(key, mood) {
    moodLog[key] = mood;
    localStorage.setItem("mood-log", JSON.stringify(moodLog));
  }

  /* =========================
     CELL RENDER
  ========================= */
  function renderCell(cell, mood) {
    const content = cell.querySelector(".day-content");
    content.innerHTML = "";

    if (!mood) {
      content.textContent = "+";
      content.style.background = "#f2f2f2";
      return;
    }

    content.style.background = mood.color;

    const label = document.createElement("span");
    label.textContent = mood.label;
    label.style.fontSize = "10px";
    label.style.opacity = "0.85";

    content.appendChild(label);
  }

  /* =========================
     CLOSE MENUS
  ========================= */
  function closeMenus() {
    moodMenu?.remove();
    moodMenu = null;

    themeOptions?.classList.add("hidden");
    fontOptions?.classList.add("hidden");
    resetPopup?.classList.add("hidden");
    moodLogPopup?.classList.add("hidden");
  }

  /* =========================
     MOOD MENU
  ========================= */
  function createMoodMenu(cell, key) {
    closeMenus();

    moodMenu = document.createElement("div");
    moodMenu.className = "mood-menu";

    moods.forEach(m => {
      const option = document.createElement("div");
      option.className = "mood-option";

      option.innerHTML = `
        <div class="mood-color" style="background:${m.color}"></div>
        <div>${m.label}</div>
      `;

      option.onclick = (e) => {
        e.stopPropagation();
        saveMood(key, m);
        renderCell(cell, m);
        closeMenus();
      };

      moodMenu.appendChild(option);
    });

    widgetBox.appendChild(moodMenu);
  }

  /* =========================
     BUILD GRID
  ========================= */
  function buildGrid() {
    grid.innerHTML = "";

    getWeekDates().forEach(({ key, day }) => {
      const cell = document.createElement("div");
      cell.className = "day-cell";

      cell.innerHTML = `
        <div class="day-label">${day}</div>
        <div class="day-content"></div>
      `;

      renderCell(cell, moodLog[key]);

      cell.onclick = (e) => {
        e.stopPropagation();
        createMoodMenu(cell, key);
      };

      grid.appendChild(cell);
    });
  }

  /* =========================
     THEME UI
  ========================= */
  themeSelector?.addEventListener("click", (e) => {
    e.stopPropagation();
    themeOptions.classList.toggle("hidden");
  });

  themeOptions?.addEventListener("click", (e) => {
    if (e.target.dataset.theme) {
      applyTheme(e.target.dataset.theme);
    }
  });

  /* =========================
     FONT UI
  ========================= */
  fontToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    fontOptions.classList.toggle("hidden");
  });

  fontChoices.forEach(opt => {
    opt.addEventListener("click", () => {
      applyFont(opt.dataset.font);
      fontOptions.classList.add("hidden");
    });
  });

  /* =========================
     RESET
  ========================= */
  resetButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    resetPopup.classList.remove("hidden");
  });

  confirmReset?.addEventListener("click", () => {
    moodLog = {};
    localStorage.removeItem("mood-log");
    buildGrid();
    resetPopup.classList.add("hidden");
  });

  cancelReset?.addEventListener("click", () => {
    resetPopup.classList.add("hidden");
  });

  /* =========================
     LOG
  ========================= */
  viewLogBtn?.addEventListener("click", () => {
    logEntriesDiv.innerHTML = "";

    Object.entries(moodLog).forEach(([k, v]) => {
      const div = document.createElement("div");
      div.textContent = `${k} → ${v.label}`;
      logEntriesDiv.appendChild(div);
    });

    moodLogPopup.classList.remove("hidden");
  });

  closeLogBtn?.addEventListener("click", () => {
    moodLogPopup.classList.add("hidden");
  });

  /* =========================
     COPY LINK
  ========================= */
  copyBtn?.addEventListener("click", async () => {
    const url =
      `${location.origin}${location.pathname}` +
      `?theme=${state.theme}&font=${state.font}&embed=true`;

    await navigator.clipboard.writeText(url);

    if (!copyMsg) return;

    copyMsg.classList.remove("hidden");
    copyMsg.classList.add("show");

    setTimeout(() => {
      copyMsg.classList.add("hidden");
    }, 1500);
  });

  /* =========================
     GLOBAL CLOSE
  ========================= */
  document.addEventListener("click", closeMenus);

  /* =========================
     INIT
  ========================= */
  applyTheme(state.theme);
  applyFont(state.font);
  buildGrid();
});
