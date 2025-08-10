document.addEventListener("DOMContentLoaded", () => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const grid = document.getElementById('mood-grid');
  const widgetBox = document.getElementById('widget-box');
  const currentThemeCircle = document.querySelector('.current-theme-circle');
  const themeOptions = document.querySelector('.theme-options');

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

  function getWeekKey() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now - start) / 86400000) + start.getDay() + 1) / 7);
    return `mood-week-${week}-${now.getFullYear()}`;
  }

  const weekKey = getWeekKey();
  let moodData = JSON.parse(localStorage.getItem(weekKey)) || {};

  function saveMood(day, value) {
    moodData[day] = value;
    localStorage.setItem(weekKey, JSON.stringify(moodData));
  }

  function createGrid() {
    days.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'day-cell';
      cell.dataset.day = day;

      const label = document.createElement('div');
      label.className = 'day-label';
      label.textContent = day;

      const content = document.createElement('div');
      content.className = 'day-content';

      if (moodData[day]) {
        content.style.backgroundColor = moodData[day].color;
        content.innerHTML = `<div>${moodData[day].label}</div>`;
      }

      cell.appendChild(label);
      cell.appendChild(content);

      cell.addEventListener('click', () => {
        document.querySelectorAll('.mood-menu').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = 'mood-menu';

        moods.forEach(mood => {
          const option = document.createElement('div');
          option.className = 'mood-option';

          const colorCircle = document.createElement('div');
          colorCircle.className = 'mood-color';
          colorCircle.style.backgroundColor = mood.color;

          const moodLabel = document.createElement('span');
          moodLabel.textContent = mood.label;

          option.appendChild(colorCircle);
          option.appendChild(moodLabel);

          option.addEventListener('click', (e) => {
            e.stopPropagation();
            content.style.backgroundColor = mood.color;
            content.innerHTML = `<div>${mood.label}</div>`;
            saveMood(day, { color: mood.color, label: mood.label });
            menu.remove();
          });

          menu.appendChild(option);
        });

        widgetBox.appendChild(menu);
      });

      grid.appendChild(cell);
    });
  }

  // Theme logic
  function setTheme(theme) {
    widgetBox.className = 'widget';
    widgetBox.classList.add(`theme-${theme}`);
    currentThemeCircle.style.backgroundColor = themes[theme];
    localStorage.setItem("selected-theme", theme);
  }

  // Load saved theme
  const savedTheme = localStorage.getItem("selected-theme") || "pink";
  setTheme(savedTheme);

  // Handle dropdown toggle
  currentThemeCircle.addEventListener("click", (e) => {
    e.stopPropagation();
    themeOptions.classList.toggle("hidden");
  });

  // Hide dropdown if clicking elsewhere
  document.addEventListener("click", () => {
    themeOptions.classList.add("hidden");
  });

  // Click on theme color
  document.querySelectorAll(".theme-option-circle").forEach(circle => {
    circle.addEventListener("click", (e) => {
      e.stopPropagation();
      const theme = circle.dataset.theme;
      setTheme(theme);
      themeOptions.classList.add("hidden");
    });
  });

  createGrid();
});
