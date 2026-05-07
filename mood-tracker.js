import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://johavlaywmsjelumhirv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaGF2bGF5d21zamVsdW1oaXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODMwNDQsImV4cCI6MjA5Mzc1OTA0NH0.rEtIZ-Pzk0paEb2wom6wG1jJ6Dej_u5FO_TIoNRygEg"
);

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     ELEMENTS
  ========================= */
  const widgetBox = document.getElementById("widget-box");
  const grid = document.getElementById("mood-grid");

  const themeToggle = document.getElementById("themeToggle");
  const themeOptions = document.getElementById("themeOptions");
  const themeCircles = document.querySelectorAll(".theme-circle");

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
     URL STATE
  ========================= */
  const params = new URLSearchParams(window.location.search);

  const state = {
    theme: params.get("theme") || "pink",
    font: params.get("font") || "default",
    embed: params.get("embed") === "true"
  };

  const widgetId =
    params.get("id") ||
    (crypto.randomUUID ? crypto.randomUUID() : `mood-${Date.now()}`);

  if (state.embed) {
    document.querySelector(".builder-ui")?.style.setProperty("display", "none");
  }

  /* =========================
     DATA
  ========================= */
  const themes = {
    pink: "#f4dfeb",
    green: "#ddedea",
    beige: "#faebdd",
    blue: "#ddebf1"
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

  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  let moodLog = {};
  let moodMenu = null;

  /* =========================
     THEME APPLY
  ========================= */
  function applyTheme(theme) {
    if (!widgetBox) return;

    widgetBox.classList.remove("pink", "green", "beige", "blue");
    widgetBox.classList.add(theme);

    state.theme = theme;
  }

  /* =========================
     FONT APPLY
  ========================= */
  function applyFont(font) {
    if (!widgetBox) return;

    const fontFamily =
      font === "serif"
        ? "Georgia, serif"
        : font === "mono"
        ? "ui-monospace, SFMono-Regular, Menlo, monospace"
        : "'Satoshi', sans-serif";

    widgetBox.style.fontFamily = fontFamily;
    state.font = font;
  }

  /* =========================
     SUPABASE LOAD
  ========================= */
  async function loadMoodLog() {
    const { data, error } = await supabase
      .from("mood_logs")
      .select("data")
      .eq("id", widgetId)
      .maybeSingle();

    if (error) {
      console.error("Supabase load error:", error);
      return;
    }

    if (data?.data) {
      moodLog = data.data;
      buildGrid();
    }
  }

  /* =========================
     SUPABASE SAVE
  ========================= */
  async function saveMood(key, mood) {
    moodLog[key] = mood;

    const { error } = await supabase
      .from("mood_logs")
      .upsert({
        id: widgetId,
        data: moodLog,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Supabase save error:", error);
    }
  }

  async function resetMoodLog() {
    moodLog = {};

    const { error } = await supabase
      .from("mood_logs")
      .upsert({
        id: widgetId,
        data: moodLog,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Supabase reset error:", error);
    }

    buildGrid();
  }

  /* =========================
     WEEK BUILDER
  ========================= */
  function getWeekDates() {
    const today = new Date();
    const start = new Date(today);

    start.setDate(today.getDate() - today.getDay());
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      return {
        day: days[i],
        key: d.toISOString().split("T")[0],
        date: d.getDate()
      };
    });
  }

  /* =========================
     RENDER CELL
  ========================= */
  function renderCell(cell, mood) {
    if (!cell) return;

    const content = cell.querySelector(".day-content");
    if (!content) return;

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

    moods.forEach((mood) => {
      const option = document.createElement("div");
      option.className = "mood-option";

      option.innerHTML = `
        <div class="mood-color" style="background:${mood.color}"></div>
        <div>${mood.label}</div>
      `;

      option.addEventListener("click", async (e) => {
        e.stopPropagation();

        renderCell(cell, mood);
        closeMenus();

        await saveMood(key, mood);
      });

      moodMenu.appendChild(option);
    });

    widgetBox.appendChild(moodMenu);
  }

  /* =========================
     BUILD GRID
  ========================= */
  function buildGrid() {
    if (!grid) return;

    grid.innerHTML = "";

    getWeekDates().forEach(({ key, day, date }) => {
      const cell = document.createElement("div");

      cell.className = "day-cell";
      cell.dataset.key = key;

      cell.innerHTML = `
        <div class="day-label">
          ${day}
          <span class="day-date">${date}</span>
        </div>
        <div class="day-content"></div>
      `;

      renderCell(cell, moodLog[key]);

      cell.addEventListener("click", (e) => {
        e.stopPropagation();
        createMoodMenu(cell, key);
      });

      grid.appendChild(cell);
    });
  }

  /* =========================
     THEME UI
  ========================= */
  themeToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    themeOptions?.classList.toggle("hidden");
  });

  themeCircles.forEach((circle) => {
    circle.addEventListener("click", (e) => {
      e.stopPropagation();

      const theme = circle.dataset.theme;
      applyTheme(theme);

      themeOptions?.classList.add("hidden");
    });
  });

  /* =========================
     FONT UI
  ========================= */
  fontToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    fontOptions?.classList.toggle("hidden");
  });

  fontChoices.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();

      const font = option.dataset.font;
      applyFont(font);

      fontOptions?.classList.add("hidden");
    });
  });

  /* =========================
     RESET
  ========================= */
  resetButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    resetPopup?.classList.remove("hidden");
  });

  confirmReset?.addEventListener("click", async (e) => {
    e.stopPropagation();

    await resetMoodLog();

    resetPopup?.classList.add("hidden");
  });

  cancelReset?.addEventListener("click", (e) => {
    e.stopPropagation();
    resetPopup?.classList.add("hidden");
  });

  /* =========================
     VIEW LOG
  ========================= */
  viewLogBtn?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!logEntriesDiv || !moodLogPopup) return;

    logEntriesDiv.innerHTML = "";

    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const totalDays = 365;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(yearStart);
      d.setDate(yearStart.getDate() + i);

      const key = d.toISOString().split("T")[0];
      const mood = moodLog[key];

      const cell = document.createElement("div");
      cell.className = "year-cell";

      if (mood) {
        cell.style.background = mood.color;
        cell.title = `${key} → ${mood.label}`;
      } else {
        cell.style.background = "#f2f2f2";
        cell.title = `${key} → no mood`;
      }

      logEntriesDiv.appendChild(cell);
    }

    moodLogPopup.classList.remove("hidden");
  });

  closeLogBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    moodLogPopup?.classList.add("hidden");
  });

  /* =========================
     COPY LINK
  ========================= */
  copyBtn?.addEventListener("click", async (e) => {
    e.stopPropagation();

    const url =
      `${location.origin}${location.pathname}` +
      `?id=${encodeURIComponent(widgetId)}` +
      `&theme=${encodeURIComponent(state.theme)}` +
      `&font=${encodeURIComponent(state.font)}` +
      `&embed=true`;

    await navigator.clipboard.writeText(url);

    copyMsg?.classList.remove("hidden");
    copyMsg?.classList.add("show");

    clearTimeout(window.__copyTimer);
    window.__copyTimer = setTimeout(() => {
      copyMsg?.classList.add("hidden");
      copyMsg?.classList.remove("show");
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
  loadMoodLog();
});
