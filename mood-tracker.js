document.addEventListener("DOMContentLoaded", () => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
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

  const themes = {
    pink: '#ffe7f5',
    green: '#e7f8ee',
    lavender: '#f6e5fc',
    blue: '#daece1'
  };

  const sparkleGifURL = "https://i.pinimg.com/originals/9e/04/6b/9e046bd40cd5e178205311426057de98.gif";

  const widgetBox = document.getElementById('widget-box');
  const grid = document.getElementById('mood-grid');
  const themeSelector = document.querySelector('.theme-selector');
  const currentThemeCircle = document.querySelector('.current-theme-circle');
  const themeOptions = document.querySelector('.theme-options');

  let moodMenu = null; // reference to open mood menu

  // ====== NEW: persistent log keyed by date ======
  let moodLog = JSON.parse(localStorage.getItem('mood-log')) || {};

  // Save mood for a specific date
  function saveMood(dateKey, mood) {
    moodLog[dateKey] = mood;
    localStorage.setItem('mood-log', JSON.stringify(moodLog));
  }

  // Close both menus
  function closeAllMenus() {
    if (moodMenu) {
      moodMenu.remove();
      moodMenu = null;
    }
    themeOptions.classList.add('hidden');
  }

  // Update a day cell to show mood
  function updateDayCell(cell, mood) {
    const content = cell.querySelector('.day-content');
    content.innerHTML = '';

    if (!mood) {
      content.textContent = '+';
      content.style.backgroundColor = '#f2f2f2';
      return;
    }

    content.style.backgroundColor = mood.color;

    if (mood.label === 'awesome') {
      const img = document.createElement('img');
      img.src = sparkleGifURL;
      img.alt = 'sparkle';
      img.style.width = '20px';
      img.style.height = '20px';
      img.style.marginRight = '4px';
      img.style.verticalAlign = 'middle';
      content.appendChild(img);
    }

    const text = document.createElement('span');
    text.textContent = mood.label;
    text.style.fontSize = '12px';
    text.style.color = '#444';
    content.appendChild(text);
  }

  // Create mood menu centered inside widget
  function createMoodMenu(dayCell, dateKey) {
    closeAllMenus();

    moodMenu = document.createElement('div');
    moodMenu.className = 'mood-menu';

    moods.forEach(mood => {
      const option = document.createElement('div');
      option.className = 'mood-option';
      option.title = mood.label;

      const colorDot = document.createElement('div');
      colorDot.className = 'mood-color';
      colorDot.style.backgroundColor = mood.color;

      const label = document.createElement('div');
      label.textContent = mood.label;

      option.appendChild(colorDot);
      option.appendChild(label);

      option.addEventListener('click', e => {
        e.stopPropagation();
        saveMood(dateKey, mood);
        updateDayCell(dayCell, mood);
        closeAllMenus();
      });

      moodMenu.appendChild(option);
    });

    widgetBox.appendChild(moodMenu);

    moodMenu.style.position = 'absolute';
    moodMenu.style.top = '50%';
    moodMenu.style.left = '50%';
    moodMenu.style.transform = 'translate(-50%, -50%)';
    moodMenu.style.zIndex = '10';
  }

  // ====== NEW: Get current week's dates ======
  function getWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6 (Sun-Sat)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
      weekDates.push({ day: days[i], dateKey: key });
    }
    return weekDates;
  }

  // Build the mood grid
 // --- inside createGrid(), update for weekday + date ---
function createGrid() {
  grid.innerHTML = '';

  const weekDates = getWeekDates(); // { day: 'mon', dateKey: 'YYYY-MM-DD' }

  weekDates.forEach(({ day, dateKey }) => {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.dataset.day = day;
    cell.dataset.date = dateKey;

    const label = document.createElement('div');
    label.className = 'day-label';
    const dateObj = new Date(dateKey);
    const month = dateObj.getMonth() + 1;
    const date = dateObj.getDate();
    label.textContent = `${day} ${month}/${date}`; // Mon 12/03

    const content = document.createElement('div');
    content.className = 'day-content';

    cell.appendChild(label);
    cell.appendChild(content);

    if (moodLog[dateKey]) {
      updateDayCell(cell, moodLog[dateKey]);
    } else {
      updateDayCell(cell, null);
    }

    cell.addEventListener('click', e => {
      e.stopPropagation();
      createMoodMenu(cell, dateKey);
      themeOptions.classList.add('hidden'); // close theme selector
    });

    grid.appendChild(cell);
  });
}

// --- Mood Log Viewer ---
const viewLogBtn = document.getElementById('view-log-btn');
const moodLogPopup = document.getElementById('mood-log-popup');
const logEntriesDiv = document.getElementById('log-entries');
const closeLogBtn = document.getElementById('close-log-btn');

viewLogBtn.addEventListener('click', e => {
  e.stopPropagation();
  logEntriesDiv.innerHTML = '';
  const entries = Object.entries(moodLog)
    .sort((a,b) => new Date(a[0]) - new Date(b[0])); // sort by date
  entries.forEach(([date, mood]) => {
    const div = document.createElement('div');
    div.innerHTML = `<span>${date}</span><span style="background:${mood.color};border-radius:50%;width:12px;height:12px;display:inline-block;margin-left:6px;"></span> ${mood.label}`;
    logEntriesDiv.appendChild(div);
  });
  moodLogPopup.classList.remove('hidden');
});

closeLogBtn.addEventListener('click', e => {
  moodLogPopup.classList.add('hidden');
});
  }

  // Load saved theme or default pink
  function loadTheme() {
    const savedTheme = localStorage.getItem('mood-theme') || 'pink';
    widgetBox.className = `widget theme-${savedTheme}`;
    currentThemeCircle.style.backgroundColor = themes[savedTheme];
  }

  function setTheme(theme) {
    widgetBox.className = 'widget';
    widgetBox.classList.add(`theme-${theme}`);
    currentThemeCircle.style.backgroundColor = themes[theme];
    localStorage.setItem('mood-theme', theme);
  }

  function setupThemeOptions() {
    themeOptions.innerHTML = '';
    Object.entries(themes).forEach(([theme, color]) => {
      const circle = document.createElement('div');
      circle.className = 'theme-option-circle';
      circle.style.backgroundColor = color;
      circle.title = theme;

      circle.addEventListener('click', e => {
        e.stopPropagation();
        setTheme(theme);
        themeOptions.classList.add('hidden');
        closeAllMenus();
      });

      themeOptions.appendChild(circle);
    });
  }

  // Reset functionality
  const resetButton = document.getElementById('reset-button');
  const resetPopup = document.getElementById('reset-popup');
  const confirmReset = document.getElementById('confirm-reset');
  const cancelReset = document.getElementById('cancel-reset');

  resetButton.addEventListener('click', (e) => {
    e.stopPropagation();
    resetPopup.classList.remove('hidden');
  });

  confirmReset.addEventListener('click', () => {
    moodLog = {};
    localStorage.removeItem('mood-log');
    createGrid();
    resetPopup.classList.add('hidden');
  });

  cancelReset.addEventListener('click', () => {
    resetPopup.classList.add('hidden');
  });

  // Toggle theme dropdown
  currentThemeCircle.addEventListener('click', e => {
    e.stopPropagation();
    const isHidden = themeOptions.classList.contains('hidden');
    closeAllMenus();
    if (isHidden) themeOptions.classList.remove('hidden');
  });

  document.body.addEventListener('click', () => closeAllMenus());

  // Initialize
  setupThemeOptions();
  loadTheme();
  createGrid();
});
