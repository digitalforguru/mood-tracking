document.addEventListener("DOMContentLoaded", () => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const grid = document.getElementById('mood-grid');
  const widgetBox = document.getElementById('widget-box');
  const gifURL = "https://i.pinimg.com/originals/9e/04/6b/9e046bd40cd5e178205311426057de98.gif";

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
    const date = new Date();
    const onejan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return `mood-week-${week}-${date.getFullYear()}`;
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
      cell.appendChild(label);

      const content = document.createElement('div');
