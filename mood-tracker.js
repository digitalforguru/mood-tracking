document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
  ========================= */
  const widgetBox = document.getElementById("widget-box");
  const grid = document.getElementById("mood-grid");

  const resetBtn = document.getElementById("reset-button");
  const resetPopup = document.getElementById("reset-popup");
  const confirmReset = document.getElementById("confirm-reset");
  const cancelReset = document.getElementById("cancel-reset");

  const viewLogBtn = document.getElementById("view-log-btn");
  const logPopup = document.getElementById("mood-log-popup");
  const logEntries = document.getElementById("log-entries");
  const closeLogBtn = document.getElementById("close-log-btn");

  const copyBtn = document.getElementById("copyLinkBtn");
  const copyMsg = document.getElementById("copyMessage");

  const themeSelector = document.querySelector(".theme-selector");
  const themeOptions = document.querySelector(".theme-options");
  const currentThemeCircle = document.querySelector(".current-theme-circle");

  const fontToggle = document.getElementById("fontToggle");

  const params = new URLSearchParams(window.location.search);

  /* =========================
     STATE FROM URL (SOURCE OF TRUTH)
  ========================= */
  function getState() {
    return {
      theme: params.get("theme") || "pink",
      font: params.get("font") || "default",
      embed: params.get("embed") === "true",
      moods: JSON.parse(params.get("moods") || "{}") // stored as JSON in URL
    };
  }

  let state = getState();
  let moodData = { ...state.moods };

  /* =========================
     THEMES
  ========================= */
  const themes = {
    pink: "#ffe7f5",
    green: "#daece1",
    lavender: "#f6e5fc",
    blue: "#dceaf5"
  };

  function applyTheme(theme) {
    widgetBox.className = `widget theme-${theme}`;
    currentThemeCircle.style.background = themes[theme];
  }

  /* =========================
     FONT SYSTEM
  ========================= */
  function applyFont(font) {
    let family = "";

    if (font === "serif") family = "Georgia, serif";
    else if (font === "mono") family = "ui-monospace, monospace";
    else family = "'Work Sans', sans-serif";

    widgetBox.style.fontFamily = family;
  }

  /* =========================
     SAVE TO URL (CORE SYSTEM)
  ========================= */
  function buildURL() {
    const base = `${location.origin}${location.pathname}`;

    const newParams = new URLSearchParams();

    newParams.set("theme", state.theme);
    newParams.set("font", state.font);
    newParams.set("embed", "true");

    if (Object.keys(moodData).length) {
      newParams.set("moods", JSON.stringify(moodData));
    }

    return `${base}?${newParams.toString()}`;
  }

  function updateURL(replace = true) {
    const url = buildURL();
    if (replace) window.history.replaceState({}, "", url);
  }

  /* =========================
     MOODS
  ========================= */
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

  /* =========================
     CELL RENDER
  ========================= */
  function setCell(cell, mood) {
    const content = cell.querySelector(".day-content");

    if (!mood) {
      content.textContent = "+";
      cell.style.background = "#f2f2f2";
      return;
    }

    cell.style.background = mood.color;
    content.textContent = mood.label;
  }

  /* =========================
     GRID BUILDER (WEEK BASED)
  ========================= */
  function buildGrid() {
    grid.innerHTML = "";

    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);

      const key = date.toISOString().split("T")[0];

      const cell = document.createElement("div");
      cell.className = "day-cell";

      const label = document.createElement("div");
      label.className = "day-label";
      label.textContent = key.slice(5);

      const content = document.createElement("div");
      content.className = "day-content";

      cell.appendChild(label);
      cell.appendChild(content);

      setCell(cell, moodData[key]);

      cell.addEventListener("click", () => {
        openMoodMenu(cell, key);
      });

      grid.appendChild(cell);
    }
  }

  /* =========================
     MOOD MENU
  ========================= */
  let activeMenu = null;

  function closeMenus() {
    if (activeMenu) {
      activeMenu.remove();
      activeMenu = null;
    }
    themeOptions?.classList.add("hidden");
    resetPopup?.classList.add("hidden");
    logPopup?.classList.add("hidden");
  }

  function openMoodMenu(cell, key) {
    closeMenus();

    const menu = document.createElement("div");
    menu.className = "mood-menu";

    moods.forEach(m => {
      const opt = document.createElement("div");
      opt.className = "mood-option";

      opt.innerHTML = `
        <div class="mood-color" style="background:${m.color}"></div>
        ${m.label}
      `;

      opt.onclick = () => {
        moodData[key] = m;
        updateURL();
        setCell(cell, m);
        menu.remove();
      };

      menu.appendChild(opt);
    });

    widgetBox.appendChild(menu);
    activeMenu = menu;
  }

  /* =========================
     RESET (URL-BASED)
  ========================= */
  resetBtn.onclick = () => resetPopup.classList.remove("hidden");

  confirmReset.onclick = () => {
    moodData = {};
    updateURL();
    buildGrid();
    resetPopup.classList.add("hidden");
  };

  cancelReset.onclick = () => resetPopup.classList.add("hidden");

  /* =========================
     VIEW LOG
  ========================= */
  viewLogBtn.onclick = () => {
    logEntries.innerHTML = "";

    Object.entries(moodData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .forEach(([date, mood]) => {
        const div = document.createElement("div");
        div.textContent = `${date} — ${mood.label}`;
        div.style.padding = "4px 0";
        logEntries.appendChild(div);
      });

    logPopup.classList.remove("hidden");
  };

  closeLogBtn.onclick = () => logPopup.classList.add("hidden");

  /* =========================
     THEME UI
  ========================= */
  themeSelector.onclick = (e) => {
    e.stopPropagation();
    themeOptions.classList.toggle("hidden");
  };

  Object.keys(themes).forEach(t => {
    const circle = document.createElement("div");
    circle.className = "theme-option-circle";
    circle.style.background = themes[t];

    circle.onclick = () => {
      state.theme = t;
      applyTheme(t);
      updateURL();
      themeOptions.classList.add("hidden");
    };

    themeOptions.appendChild(circle);
  });

  /* =========================
     FONT (APPLIES TO EVERYTHING)
  ========================= */
  fontToggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    const fonts = ["default", "serif", "mono"];
    const current = state.font;

    const next = fonts[(fonts.indexOf(current) + 1) % fonts.length];

    state.font = next;
    applyFont(next);
    updateURL();
  });

  /* =========================
     COPY LINK (FULL STATE)
  ========================= */
  copyBtn?.addEventListener("click", async () => {
    const url = buildURL();

    await navigator.clipboard.writeText(url);

    copyMsg.classList.remove("hidden");

    setTimeout(() => {
      copyMsg.classList.add("hidden");
    }, 1500);
  });

  /* =========================
     GLOBAL CLICK CLOSE
  ========================= */
  document.body.addEventListener("click", closeMenus);

  /* =========================
     INIT
  ========================= */
  applyTheme(state.theme);
  applyFont(state.font);
  buildGrid();
});
