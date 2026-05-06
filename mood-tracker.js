document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS (SAFE MODE)
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

  const themeSelector = document.querySelector(".theme-selector");
  const themeOptions = document.querySelector(".theme-options");

  const copyBtn = document.getElementById("copyLinkBtn");
  const copyMsg = document.getElementById("copyMessage");

  const fontToggle = document.getElementById("fontToggle");

  const params = new URLSearchParams(window.location.search);

  /* =========================
     URL STATE (SOURCE OF TRUTH)
  ========================= */
  function getState() {
    return {
      theme: params.get("theme") || "pink",
      font: params.get("font") || "default",
      embed: params.get("embed") === "true",
      moods: JSON.parse(params.get("moods") || "{}")
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
    if (!widgetBox) return;
    widgetBox.className = `widget theme-${theme}`;
  }

  /* =========================
     FONT SYSTEM (FIXED)
  ========================= */
  function applyFont(font) {
    let family = "";

    if (font === "serif") family = "Georgia, serif";
    else if (font === "mono") family = "ui-monospace, monospace";
    else family = "'Work Sans', sans-serif";

    document.body.style.fontFamily = family;
    if (widgetBox) widgetBox.style.fontFamily = family;
  }

  /* =========================
     URL BUILDER
  ========================= */
  function buildURL() {
    const base = `${location.origin}${location.pathname}`;
    const p = new URLSearchParams();

    p.set("theme", state.theme);
    p.set("font", state.font);
    p.set("embed", "true");

    if (Object.keys(moodData).length) {
      p.set("moods", JSON.stringify(moodData));
    }

    return `${base}?${p.toString()}`;
  }

  function updateURL() {
    window.history.replaceState({}, "", buildURL());
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
     GRID
  ========================= */
  function buildGrid() {
    if (!grid) return;

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

      cell.addEventListener("click", () => openMoodMenu(cell, key));

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

    widgetBox?.appendChild(menu);
    activeMenu = menu;
  }

  /* =========================
     RESET
  ========================= */
  resetBtn?.addEventListener("click", () => {
    resetPopup?.classList.remove("hidden");
  });

  confirmReset?.addEventListener("click", () => {
    moodData = {};
    updateURL();
    buildGrid();
    resetPopup?.classList.add("hidden");
  });

  cancelReset?.addEventListener("click", () => {
    resetPopup?.classList.add("hidden");
  });

  /* =========================
     VIEW LOG
  ========================= */
  viewLogBtn?.addEventListener("click", () => {
    if (!logEntries) return;

    logEntries.innerHTML = "";

    Object.entries(moodData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .forEach(([date, mood]) => {
        const div = document.createElement("div");
        div.textContent = `${date} — ${mood.label}`;
        logEntries.appendChild(div);
      });

    logPopup?.classList.remove("hidden");
  });

  closeLogBtn?.addEventListener("click", () => {
    logPopup?.classList.add("hidden");
  });

  /* =========================
     THEME (SAFE FIX)
  ========================= */
  if (themeSelector && themeOptions) {
    themeSelector.addEventListener("click", (e) => {
      e.stopPropagation();
      themeOptions.classList.toggle("hidden");
    });
  }

  Object.keys(themes).forEach(t => {
    const circle = document.createElement("div");
    circle.className = "theme-option-circle";
    circle.style.background = themes[t];

    circle.addEventListener("click", () => {
      state.theme = t;
      applyTheme(t);
      updateURL();
      themeOptions?.classList.add("hidden");
    });

    themeOptions?.appendChild(circle);
  });

  /* =========================
     FONT (SAFE + WORKING)
  ========================= */
  fontToggle?.addEventListener("click", () => {
    const fonts = ["default", "serif", "mono"];
    const current = state.font;

    const next = fonts[(fonts.indexOf(current) + 1) % fonts.length];

    state.font = next;
    applyFont(next);
    updateURL();
  });

  /* =========================
     COPY LINK (FIXED)
  ========================= */
  copyBtn?.addEventListener("click", async () => {
    const url = buildURL();

    try {
      await navigator.clipboard.writeText(url);

      if (!copyMsg) return;

      copyMsg.classList.remove("hidden");

      setTimeout(() => {
        copyMsg.classList.add("hidden");
      }, 1500);

    } catch (err) {
      console.error("copy failed", err);
    }
  });

  /* =========================
     CLOSE ON OUTSIDE CLICK
  ========================= */
  document.body.addEventListener("click", closeMenus);

  /* =========================
     INIT
  ========================= */
  applyTheme(state.theme);
  applyFont(state.font);
  buildGrid();

});
