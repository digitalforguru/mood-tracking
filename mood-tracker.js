document.addEventListener("DOMContentLoaded", () => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const moods = [
    { color: '#FFF5B7', label: 'good' },
    { color: '#FCD5CE', label: 'loved' },
    { color: '#C3DDFD', label: 'rough' },
    { color: '#E6E6FA', label: 'calm' },
    { color: '#FFDACC', label: 'social' },
    { color: '#C4F1F9', label: 'focused' },
    { color: '#D3D3D3', label: 'meh' },
    { color: '#FFC0CB', label: 'awesome' }
  ];

  const themes = {
    pink: '#ffeef2',
    green: '#e7f8ee',
    lavender: '#f3e8ff',
    blue: '#e0f0ff'
  };

  const sparkleGifURL = "https://i.pinimg.com/originals/9e/04/6b/9e046bd40cd5e178205311426057de98.gif";

  const widgetBox = document.getElementById('widget-box');
  const grid = document.getElementById('mood-grid');
  const themeSelector = document.querySelector('.theme-selector');
  const currentThemeCircle = document.querySelector('.current-theme-circle');
  const themeOptions = document.querySelector('.theme-options');

  // Weekly reset key for storage
  function getWeekKey() {
    const date = new Date();
    const firstJan = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstJan) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstJan.getDay() + 1) / 7);
    return `mood-week-${weekNumber}-${date.getFullYear()}`;
  }

  let weekKey = getWeekKey();
  let moodData = JSON.parse(localStorage.getItem(weekKey)) || {};

  // Save mood selection for day
  function saveMood(day, mood) {
    moodData[day] = mood;
    localStorage.setItem(weekKey, JSON.stringify(moodData));
  }

  // Build mood option elements for menu
  function createMoodMenu(dayCell) {
    // Remove existing menu if any
    const existingMenu = dayCell.querySelector('.mood-menu');
    if (existingMenu) {
      existingMenu.remove();
      return;
    }

    const menu = document.createElement('div');
    menu.className = 'mood-menu';

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
        menu.remove();
      });

      menu.appendChild(option);
    });

   widgetBox.appendChild(menu);

// Store reference to which day this menu belongs to (for positioning & closing)
menu.dataset.day = dayCell.dataset.day;

  }

  // Update a day cell's display based on selected mood or empty
  function updateDayCell(cell, mood) {
    const content = cell.querySelector('.day-content');
    content.innerHTML = ''; // Clear content

    if (!mood) {
      // Show plus sign if no mood
      content.textContent = '+';
      content.style.backgroundColor = '#f2f2f2';
      return;
    }

    // Set background color
    content.style.backgroundColor = mood.color;

    // If awesome mood, add sparkle gif
    if (mood.label === 'awesome') {
      const img = document.createElement('img');
      img.src = sparkleGifURL;
      img.alt = 'sparkle';
      content.appendChild(img);
    }

    // Mood label text
    const text = document.createElement('div');
    text.textContent = mood.label;
    content.appendChild(text);
  }

  // Create grid with days and current moods loaded
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

      // Load saved mood or default "+"
      if (moodData[day]) {
        updateDayCell(cell, moodData[day]);
      } else {
        updateDayCell(cell, null);
      }

      // On click toggle mood menu
      cell.addEventListener('click', e => {
        e.stopPropagation();
        closeAllMenus();
        createMoodMenu(cell);
      });

      grid.appendChild(cell);
    });
  }

  // Close any open mood menus on clicking outside
  function closeAllMenus() {
    document.querySelectorAll('.mood-menu').forEach(menu => menu.remove());
  }

  // Theme selector toggling
  themeSelector.addEventListener('click', e => {
    e.stopPropagation();
    themeOptions.classList.toggle('hidden');
  });

  // Change theme when selecting a theme circle
  themeOptions.querySelectorAll('.theme-option-circle').forEach(option => {
   option.addEventListener('click', e => {
  e.stopPropagation();
  saveMood(menu.dataset.day, mood);
  updateDayCell(document.querySelector(`.day-cell[data-day="${menu.dataset.day}"]`), mood);
  menu.remove();
});

  });

  // Load saved theme or default pink
  function loadTheme() {
    const savedTheme = localStorage.getItem('mood-theme') || 'pink';
    widgetBox.className = `widget theme-${savedTheme}`;
    currentThemeCircle.style.backgroundColor = themes[savedTheme];
  }

  // Close menus if clicking outside widget
  document.body.addEventListener('click', () => {
    closeAllMenus();
    themeOptions.classList.add('hidden');
  });

  // On load
  loadTheme();
  createGrid();
});

