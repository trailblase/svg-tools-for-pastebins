import { lerpColor } from '../shared/color.js';
import '../shared/components.js';
import { copyFromOutput } from '../shared/persistence.js';

function updateHex(input) {
  const hex = input.value.toUpperCase();
  input.parentElement.querySelector('.color-hex').textContent = hex;
  updateGradientBar();
  generate();
}

function getColors() {
  return Array.from(document.querySelectorAll('#colorStops input[type="color"]'))
    .map(input => input.value.toUpperCase());
}

function updateGradientBar() {
  const colors = getColors();
  document.getElementById('gradientBar').style.background =
    `linear-gradient(to right, ${colors.join(', ')})`;
}

function makeColorStop(hex) {
  const stop = document.createElement('div');
  stop.className = 'color-stop';
  stop.innerHTML = `
    <input type="color" value="${hex}">
    <span class="color-hex">${hex}</span>
    <button class="remove-btn">×</button>
  `;
  return stop;
}

function addColor() {
  const container = document.getElementById('colorStops');
  const addBtn = container.querySelector('.add-color-btn');
  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
  container.insertBefore(makeColorStop(randomColor), addBtn);
  updateGradientBar();
  generate();
}

function removeColor(btn) {
  const stops = document.querySelectorAll('.color-stop');
  if (stops.length <= 2) {
    alert('You need at least 2 colors for a gradient!');
    return;
  }
  btn.parentElement.remove();
  updateGradientBar();
  generate();
}

function importColors(raw) {
  const str = raw.trim();
  const btn = document.getElementById('importBtn');
  function feedback(msg) {
    if (!btn) return;
    btn.textContent = msg;
    setTimeout(() => { btn.textContent = 'Import'; }, 1500);
  }

  if (!str) { feedback('Empty'); return; }

  const coolorsMatch = str.match(/coolors\.co\/([a-fA-F0-9\-]+)/);
  if (coolorsMatch) {
    const cols = coolorsMatch[1]
      .split('-')
      .filter(s => /^[a-fA-F0-9]{6}$/.test(s))
      .map(s => '#' + s.toUpperCase());
    if (cols.length >= 1) {
      addColors(cols);
      document.getElementById('importInput').value = '';
      feedback('Imported!');
      return;
    }
  }

  const cols = [...new Set(
    str.split(/[^a-fA-F0-9]+/)
      .filter(s => /^[a-fA-F0-9]{6}$/.test(s))
      .map(s => '#' + s.toUpperCase())
  )];

  if (cols.length < 1) { feedback('No colors found'); return; }
  addColors(cols);
  document.getElementById('importInput').value = '';
  feedback('Imported!');
}

function addColors(colors) {
  const container = document.getElementById('colorStops');
  const addBtn = container.querySelector('.add-color-btn');
  colors.forEach(color => {
    container.insertBefore(makeColorStop(color.toUpperCase()), addBtn);
  });
  updateGradientBar();
  generate();
}

function applyPreset(colors) {
  const container = document.getElementById('colorStops');
  const addBtn = container.querySelector('.add-color-btn');
  container.querySelectorAll('.color-stop').forEach(stop => stop.remove());
  colors.forEach(color => {
    container.insertBefore(makeColorStop(color.toUpperCase()), addBtn);
  });
  updateGradientBar();
  generate();
}

function getGradientColor(colors, position) {
  if (colors.length === 1) return colors[0];
  if (position <= 0) return colors[0];
  if (position >= 1) return colors[colors.length - 1];
  const segments = colors.length - 1;
  const scaledPos = position * segments;
  const segmentIndex = Math.floor(scaledPos);
  const segmentProgress = scaledPos - segmentIndex;
  const startIndex = Math.min(segmentIndex, colors.length - 2);
  return lerpColor(colors[startIndex], colors[startIndex + 1], segmentProgress);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generate() {
  const text = document.getElementById('textInput').value;
  const colors = getColors();
  let output = '';
  let previewHtml = '';

  if (text.length === 0) {
    document.getElementById('output').textContent = '';
    document.getElementById('preview').innerHTML = '<span style="color: var(--text-subtle)">Enter some text above</span>';
    return;
  }

  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    const position = text.length === 1 ? 0 : i / (text.length - 1);
    const color = getGradientColor(colors, position);
    if (char === ' ') {
      output += ' ';
      previewHtml += `<span style="color:${color}">&nbsp;</span>`;
    } else {
      output += '%' + color + '%' + char + '%%';
      previewHtml += `<span style="color:${color}">${escapeHtml(char)}</span>`;
    }
  }

  document.getElementById('output').textContent = output;
  document.getElementById('preview').innerHTML = previewHtml;
}

// Event delegation for dynamic color stops
document.getElementById('colorStops').addEventListener('input', e => {
  if (e.target.type === 'color') updateHex(e.target);
});
document.getElementById('colorStops').addEventListener('click', e => {
  if (e.target.classList.contains('remove-btn')) removeColor(e.target);
});

document.getElementById('addColorBtn').addEventListener('click', addColor);
document.getElementById('importBtn').addEventListener('click', () => {
  importColors(document.getElementById('importInput').value);
});
document.getElementById('importInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') importColors(e.target.value);
});

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => applyPreset(btn.dataset.preset.split(',')));
});

document.getElementById('textInput').addEventListener('input', generate);
document.getElementById('copyBtn').addEventListener('click', copyFromOutput);

updateGradientBar();
generate();
