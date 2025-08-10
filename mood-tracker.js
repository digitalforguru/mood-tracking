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
  let weekKey = getWeekKey();
  let moodData = JSON.parse(localStorage.getItem(weekKey)) || {};

  // Get current week key for weekly reset
  function getWeekKey() {
    const date = new Date();
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstJan) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstJan.getDay() + 1) / 7);
    return `mood-week-${weekNumber}-${date.getFullYear()}`;
  }

  // Save mood for a day
  function saveMood(day, mood) {
    moodData[day] = mood;
    localStorage.setItem(weekKey, JSON.stringify(moodData));
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
  function createMoodMenu(dayCell) {
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
        saveMood(dayCell.dataset.day, mood);
        updateDayCell(dayCell, mood);
        closeAllMenus();
      });

      moodMenu.appendChild(option);
    });

    widgetBox.appendChild(moodMenu);

    // Center the mood menu inside the widget
    moodMenu.style.position = 'absolute';
    moodMenu.style.top = '50%';
    moodMenu.style.left = '50%';
    moodMenu.style.transform = 'translate(-50%, -50%)';
    moodMenu.style.zIndex = '10';
  }

  // Build the mood grid with days
  function createGrid() {
    grid.innerHTML = '';

    days.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.dataset.day = day;

      const label = document.createElement('div');
      label.className = 'day-label';
      label.textContent = day;

      const content = document.createElement('div');
      content.className = 'day-content';

      cell.appendChild(label);
      cell.appendChild(content);

      if (moodData[day]) {
        updateDayCell(cell, moodData[day]);
      } else {
        updateDayCell(cell, null);
      }

      cell.addEventListener('click', e => {
        e.stopPropagation();
        createMoodMenu(cell);
        themeOptions.classList.add('hidden'); // close theme selector if open
      });

      grid.appendChild(cell);
    });
  }

  // Load saved theme or default pink
  function loadTheme() {
    const savedTheme = localStorage.getItem('mood-theme') || 'pink';
    widgetBox.className = `widget theme-${savedTheme}`;
    currentThemeCircle.style.backgroundColor = themes[savedTheme];
  }

  // Set theme and save to localStorage
  function setTheme(theme) {
    widgetBox.className = 'widget';
    widgetBox.classList.add(`theme-${theme}`);
    currentThemeCircle.style.backgroundColor = themes[theme];
    localStorage.setItem('mood-theme', theme);
  }

  // Setup theme options circles dynamically
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
  // Reset button functionality
  const resetButton = document.getElementById('reset-button');
  const resetPopup = document.getElementById('reset-popup');
  const confirmReset = document.getElementById('confirm-reset');
  const cancelReset = document.getElementById('cancel-reset');

  resetButton.addEventListener('click', (e) => {
    e.stopPropagation();
    resetPopup.classList.remove('hidden');
  });

  confirmReset.addEventListener('click', () => {
    moodData = {};
    localStorage.removeItem(weekKey);
    createGrid(); // Rebuild grid after reset
    resetPopup.classList.add('hidden');
  });

  cancelReset.addEventListener('click', () => {
    resetPopup.classList.add('hidden');
  });


  // Toggle theme options dropdown
  currentThemeCircle.addEventListener('click', e => {
    e.stopPropagation();
    const isHidden = themeOptions.classList.contains('hidden');
    closeAllMenus();
    if (isHidden) {
      themeOptions.classList.remove('hidden');
    } else {
      themeOptions.classList.add('hidden');
    }
  });

  // Clicking outside closes menus
  document.body.addEventListener('click', () => {
    closeAllMenus();
  });

  // Initialize
  setupThemeOptions();
  loadTheme();
  createGrid();
});
