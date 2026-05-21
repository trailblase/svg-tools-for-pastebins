import { escXML } from '../shared/svg.js';
import '../shared/components.js';
import { copyFromOutput } from '../shared/persistence.js';

const fonts = [
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Times New Roman', family: 'Times New Roman, Times, serif' },
  { name: 'Palatino', family: 'Palatino Linotype, Palatino, serif' },
  { name: 'Garamond', family: 'Garamond, serif' },
  { name: 'Cambria', family: 'Cambria, serif' },
  { name: 'Arial', family: 'Arial, Helvetica, sans-serif' },
  { name: 'Verdana', family: 'Verdana, Geneva, sans-serif' },
  { name: 'Trebuchet MS', family: 'Trebuchet MS, sans-serif' },
  { name: 'Tahoma', family: 'Tahoma, Geneva, sans-serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
  { name: 'Impact', family: 'Impact, Charcoal, sans-serif' },
  { name: 'Century Gothic', family: 'Century Gothic, sans-serif' },
  { name: 'Segoe UI', family: 'Segoe UI, sans-serif' },
  { name: 'Calibri', family: 'Calibri, sans-serif' },
  { name: 'Courier New', family: 'Courier New, Courier, monospace' },
  { name: 'Consolas', family: 'Consolas, monospace' },
  { name: 'Comic Sans MS', family: 'Comic Sans MS, cursive' },
  { name: 'Brush Script MT', family: 'Brush Script MT, cursive' },
  { name: 'Papyrus', family: 'Papyrus, fantasy' },
  { name: 'Copperplate', family: 'Copperplate, fantasy' },
];

let selectedFont = fonts[0];
let isBold = false;
let isItalic = false;
let colorMode = 'solid';
let pfpDataUrl = null;

const S = 220;
const cx = S / 2, cy = S / 2;
const pfpR = 72;
const textR = pfpR + 16;

function initFontGrid() {
  const grid = document.getElementById('fontGrid');
  fonts.forEach((font, i) => {
    const el = document.createElement('div');
    el.className = 'font-option' + (i === 0 ? ' selected' : '');
    el.style.fontFamily = font.family;
    el.textContent = font.name;
    el.addEventListener('click', () => {
      document.querySelectorAll('#fontGrid .font-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
      selectedFont = font;
      build();
    });
    grid.appendChild(el);
  });
}

function toggleStyle(s) {
  if (s === 'bold') {
    isBold = !isBold;
    document.getElementById('btnBold').classList.toggle('active', isBold);
  } else {
    isItalic = !isItalic;
    document.getElementById('btnItalic').classList.toggle('active', isItalic);
  }
  build();
}

function setColorMode(mode) {
  colorMode = mode;
  document.querySelectorAll('[data-color]').forEach(b => b.classList.toggle('active', b.dataset.color === mode));
  document.getElementById('solidColorSection').style.display = mode === 'solid' ? '' : 'none';
  document.getElementById('gradientColorSection').style.display = mode === 'gradient' ? '' : 'none';
  build();
}

function build() {
  const text       = document.getElementById('spinText').value;
  const fontSize   = parseInt(document.getElementById('fontSize').value) || 13;
  const fontWeight = document.getElementById('fontWeight').value;
  const spacing    = parseInt(document.getElementById('letterSpacing').value) || 0;
  const spinSpeed  = parseFloat(document.getElementById('spinSpeed').value) || 8;
  const spinDir    = parseInt(document.getElementById('spinDir').value);
  const showRing   = document.getElementById('showRing').checked;
  const ringColor  = document.getElementById('ringColor').value;
  const ringW      = showRing ? (parseInt(document.getElementById('ringWidth').value) || 3) : 0;
  const bgColor    = document.getElementById('bgColor').value;
  const cardShape  = document.getElementById('cardShape').value;

  const fontStyle  = isItalic ? 'italic' : 'normal';
  const weight     = isBold ? 700 : parseInt(fontWeight);

  const r = textR;
  const circlePath = `M ${cx},${cy - r} A ${r},${r} 0 1 1 ${cx - 0.01},${cy - r}`;

  const bgEl = cardShape === 'none' ? '' :
    cardShape === 'circle'
      ? `<circle cx="${cx}" cy="${cy}" r="${S/2 - 1}" fill="${bgColor}"/>`
      : `<rect width="${S}" height="${S}" rx="12" fill="${bgColor}"/>`;

  const ringEl = ringW > 0
    ? `<circle cx="${cx}" cy="${cy}" r="${pfpR}" fill="none" stroke="${ringColor}" stroke-width="${ringW}"/>`
    : '';

  const clipR = pfpR - ringW / 2;

  let textFill, gradDef = '';
  if (colorMode === 'gradient') {
    const gs = document.getElementById('gradStart').value;
    const ge = document.getElementById('gradEnd').value;
    gradDef = `<linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${gs}"/>
      <stop offset="100%" stop-color="${ge}"/>
    </linearGradient>`;
    textFill = 'url(#tg)';
  } else {
    textFill = document.getElementById('solidColor').value;
  }

  const fromDeg = spinDir === 1 ? '0' : '360';
  const toDeg   = spinDir === 1 ? '360' : '0';

  const fontAttr = `font-family="${escXML(selectedFont.family)}" font-size="${fontSize}" font-weight="${weight}" font-style="${fontStyle}" fill="${textFill}" letter-spacing="${spacing}"`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>
    <path id="spinPath" d="${circlePath}"/>
    ${gradDef}
    ${pfpDataUrl ? `<clipPath id="pfpClip"><circle cx="${cx}" cy="${cy}" r="${clipR}"/></clipPath>` : ''}
  </defs>
  ${bgEl}
  ${pfpDataUrl
    ? `<image href="${pfpDataUrl}" x="${cx - pfpR}" y="${cy - pfpR}" width="${pfpR*2}" height="${pfpR*2}" clip-path="url(#pfpClip)"/>`
    : `<circle cx="${cx}" cy="${cy}" r="${clipR}" fill="#333"/>
       <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#666" font-size="13" font-family="system-ui">no image</text>`}
  ${ringEl}
  <g>
    <animateTransform attributeName="transform" type="rotate" from="${fromDeg} ${cx} ${cy}" to="${toDeg} ${cx} ${cy}" dur="${spinSpeed}s" repeatCount="indefinite"/>
    <text ${fontAttr} text-anchor="start">
      <textPath href="#spinPath">${escXML(text)}</textPath>
    </text>
  </g>
</svg>`;

  document.getElementById('previewContent').innerHTML = `<div style="width:${S}px">${svg}</div>`;

  const b64 = btoa(unescape(encodeURIComponent(svg)));
  document.getElementById('codeOutput').textContent = `![Circle Widget](data:image/svg+xml;base64,${b64})`;
}

document.querySelectorAll('[data-style]').forEach(btn => {
  btn.addEventListener('click', () => toggleStyle(btn.dataset.style));
});
document.querySelectorAll('[data-color]').forEach(btn => {
  btn.addEventListener('click', () => setColorMode(btn.dataset.color));
});

document.getElementById('letterSpacing').addEventListener('input', e => {
  document.getElementById('spacingValue').textContent = e.target.value + 'px';
  build();
});

document.getElementById('pfpUpload').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    if (file.type === 'image/gif') {
      pfpDataUrl = e.target.result;
      build();
    } else {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById('resizeCanvas');
        const ctx = canvas.getContext('2d');
        const size = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 200, 200);
        pfpDataUrl = canvas.toDataURL('image/png');
        build();
      };
      img.src = e.target.result;
    }
  };
  reader.readAsDataURL(file);
});

document.getElementById('showRing').addEventListener('change', function () {
  document.getElementById('ringOptions').style.display = this.checked ? '' : 'none';
  build();
});

['spinText'].forEach(id => document.getElementById(id).addEventListener('input', build));
['fontSize','fontWeight','spinSpeed','spinDir','ringWidth','cardShape'].forEach(id =>
  document.getElementById(id).addEventListener('change', build));

[
  ['solidColor','solidColorHex'],
  ['gradStart','gradStartHex'],
  ['gradEnd','gradEndHex'],
  ['ringColor','ringColorHex'],
  ['bgColor','bgColorHex'],
].forEach(([pid, hid]) => {
  const p = document.getElementById(pid), h = document.getElementById(hid);
  if (!p || !h) return;
  p.addEventListener('input', () => { h.value = p.value; build(); });
  h.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(h.value)) { p.value = h.value; build(); } });
});

document.getElementById('copyBtn').addEventListener('click', copyFromOutput);

initFontGrid();
build();
