import { lerpColor } from '../shared/color.js';
import { escXML } from '../shared/svg.js';
import '../shared/components.js';
import { copyFromOutput } from '../shared/persistence.js';

const H1 = [0.40, 0.72, 0.95, 0.85, 0.90, 0.78, 0.55, 0.48, 0.65, 0.80, 0.92, 0.70, 0.45, 0.60, 0.88, 0.50];
const H2 = [0.65, 0.45, 0.80, 0.95, 0.70, 0.90, 0.40, 0.75, 0.85, 0.60, 0.50, 0.88, 0.72, 0.40, 0.65, 0.78];
const H3 = [0.88, 0.70, 0.50, 0.72, 0.95, 0.55, 0.80, 0.60, 0.45, 0.90, 0.75, 0.48, 0.85, 0.65, 0.42, 0.92];
const HPAUSE = 0.15;

let barColorMode = 'solid';
let barShape = 'sharp';
let playerState = 'playing';
let albumDataUrl = null;
let cardLayout = 'wide';

function buildSVG() {
  const song = document.getElementById('songName').value.trim() || 'Song Name';
  const artist = document.getElementById('artistName').value.trim() || 'Artist';
  const cardBg = document.getElementById('cardBg').value;
  const songColor = document.getElementById('songColor').value;
  const artistColor = document.getElementById('artistColor').value;
  const logoColor = document.getElementById('logoColor').value;
  const barCount = Math.min(16, Math.max(3, parseInt(document.getElementById('barCount').value) || 8));
  const showProgress = document.getElementById('showProgress').checked;
  const progressPct = parseInt(document.getElementById('progressPct').value) || 40;
  const progressColor = document.getElementById('progressColor').value;

  const W = 520, H = 120;
  const logoSize = 88;
  const logoX = 14;
  const logoY = (H - logoSize) / 2;
  const logoScale = logoSize / 64;

  const barAreaW = 160;
  const barsRight = W - 20;
  const barsLeft = barsRight - barAreaW;
  const barGap = 4;
  const barW = Math.max(3, Math.floor((barAreaW - (barCount - 1) * barGap) / barCount));
  const barsBottom = showProgress ? H - 28 : H - 14;
  const barsTop = 14;
  const maxBarH = barsBottom - barsTop;

  const infoX = logoX + logoSize + 14;
  const infoW = barsLeft - infoX - 10;
  const songY = showProgress ? 46 : 50;
  const artistY = showProgress ? 66 : 70;

  let barRects = '';
  for (let i = 0; i < barCount; i++) {
    const t = barCount > 1 ? i / (barCount - 1) : 0;
    const color = barColorMode === 'solid'
      ? document.getElementById('barColor').value
      : lerpColor(document.getElementById('barGradStart').value, document.getElementById('barGradEnd').value, t);

    const barX = barsLeft + i * (barW + barGap);
    const rx = barShape === 'rounded' ? Math.min(Math.floor(barW / 2), 4) : 0;

    if (playerState === 'playing') {
      const h1 = Math.max(4, H1[i % H1.length] * maxBarH);
      const h2 = Math.max(4, H2[i % H2.length] * maxBarH);
      const h3 = Math.max(4, H3[i % H3.length] * maxBarH);
      const y1 = (barsBottom - h1).toFixed(0);
      const y2 = (barsBottom - h2).toFixed(0);
      const y3 = (barsBottom - h3).toFixed(0);
      const dur = (1.0 + (i * 0.17) % 0.9).toFixed(2);
      barRects += `<rect x="${barX}" width="${barW}" rx="${rx}" fill="${color}">` +
        `<animate attributeName="height" values="${h1.toFixed(0)};${h2.toFixed(0)};${h3.toFixed(0)};${h1.toFixed(0)}" dur="${dur}s" repeatCount="indefinite"/>` +
        `<animate attributeName="y" values="${y1};${y2};${y3};${y1}" dur="${dur}s" repeatCount="indefinite"/>` +
        `</rect>`;
    } else {
      const h = Math.max(4, HPAUSE * maxBarH);
      const y = (barsBottom - h).toFixed(0);
      barRects += `<rect x="${barX}" y="${y}" width="${barW}" height="${h.toFixed(0)}" rx="${rx}" fill="${color}"/>`;
    }
  }

  const progressFilled = showProgress ? (infoW * progressPct / 100).toFixed(1) : 0;
  const progressSvg = showProgress
    ? `<rect x="0" y="${H - 26}" width="${infoW}" height="3" rx="1.5" fill="${artistColor}" opacity="0.2"/>` +
      `<rect x="0" y="${H - 26}" width="${progressFilled}" height="3" rx="1.5" fill="${progressColor}"/>`
    : '';

  const leftEl = albumDataUrl
    ? `<defs><clipPath id="ac"><rect x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" rx="6"/></clipPath></defs>` +
      `<image href="${albumDataUrl}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" clip-path="url(#ac)"/>`
    : `<g transform="translate(${logoX}, ${logoY}) scale(${logoScale})">` +
      `<path d="M32 0C14.3 0 0 14.337 0 32c0 17.7 14.337 32 32 32 17.7 0 32-14.337 32-32S49.663 0 32 0zm14.68 46.184c-.573.956-1.797 1.223-2.753.65-7.532-4.588-16.975-5.62-28.14-3.097-1.07.23-2.14-.42-2.37-1.49s.42-2.14 1.49-2.37c12.196-2.79 22.67-1.606 31.082 3.556a2 2 0 0 1 .688 2.753zm3.9-8.717c-.726 1.185-2.256 1.53-3.44.84-8.602-5.276-21.716-6.805-31.885-3.747-1.338.382-2.714-.344-3.097-1.644-.382-1.338.344-2.714 1.682-3.097 11.622-3.517 26.074-1.835 35.976 4.244 1.147.688 1.49 2.217.765 3.403zm.344-9.1c-10.323-6.117-27.336-6.69-37.2-3.708-1.568.497-3.25-.42-3.747-1.988s.42-3.25 1.988-3.747c11.317-3.44 30.127-2.753 41.98 4.282 1.415.84 1.873 2.676 1.032 4.09-.765 1.453-2.638 1.912-4.053 1.07z" fill="${logoColor}"/>` +
      `</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="12" fill="${cardBg}"/>
  ${leftEl}
  <svg x="${infoX}" y="0" width="${infoW}" height="${H}" overflow="hidden">
    <text y="${songY}" font-family="system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif" font-size="18" font-weight="700" fill="${escXML(songColor)}">${escXML(song)}</text>
    <text y="${artistY}" font-family="system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif" font-size="13" fill="${escXML(artistColor)}">${escXML(artist)}</text>
    ${progressSvg}
  </svg>
  ${barRects}
</svg>`;
}

function buildSquareSVG() {
  const song = document.getElementById('songName').value.trim() || 'Song Name';
  const artist = document.getElementById('artistName').value.trim() || 'Artist';
  const cardBg = document.getElementById('cardBg').value;
  const songColor = document.getElementById('songColor').value;
  const artistColor = document.getElementById('artistColor').value;
  const logoColor = document.getElementById('logoColor').value;
  const barCount = Math.min(16, Math.max(3, parseInt(document.getElementById('barCount').value) || 8));
  const showProgress = document.getElementById('showProgress').checked;
  const progressPct = parseInt(document.getElementById('progressPct').value) || 40;
  const progressColor = document.getElementById('progressColor').value;

  const W = 220, H = 330;
  const pad = 14;
  const artSize = 180;
  const artX = (W - artSize) / 2;
  const artY = pad;
  const rx = barShape === 'rounded' ? 3 : 0;

  const songY = artY + artSize + 28;
  const artistY2 = songY + 20;
  const cx = W / 2;

  const barsBottom = H - pad;
  const barsY = artistY2 + (showProgress ? 26 : 18);
  const maxBarH = barsBottom - barsY;
  const barGap = 3;
  const barW = Math.max(3, Math.floor((artSize - (barCount - 1) * barGap) / barCount));

  let barRects = '';
  for (let i = 0; i < barCount; i++) {
    const t = barCount > 1 ? i / (barCount - 1) : 0;
    const color = barColorMode === 'solid'
      ? document.getElementById('barColor').value
      : lerpColor(document.getElementById('barGradStart').value, document.getElementById('barGradEnd').value, t);
    const barX = artX + i * (barW + barGap);

    if (playerState === 'playing') {
      const h1 = Math.max(4, H1[i % H1.length] * maxBarH);
      const h2 = Math.max(4, H2[i % H2.length] * maxBarH);
      const h3 = Math.max(4, H3[i % H3.length] * maxBarH);
      const y1 = (barsBottom - h1).toFixed(0);
      const y2 = (barsBottom - h2).toFixed(0);
      const y3 = (barsBottom - h3).toFixed(0);
      const dur = (1.0 + (i * 0.17) % 0.9).toFixed(2);
      barRects += `<rect x="${barX}" width="${barW}" rx="${rx}" fill="${color}">` +
        `<animate attributeName="height" values="${h1.toFixed(0)};${h2.toFixed(0)};${h3.toFixed(0)};${h1.toFixed(0)}" dur="${dur}s" repeatCount="indefinite"/>` +
        `<animate attributeName="y" values="${y1};${y2};${y3};${y1}" dur="${dur}s" repeatCount="indefinite"/>` +
        `</rect>`;
    } else {
      const h = Math.max(4, HPAUSE * maxBarH);
      const y = (barsBottom - h).toFixed(0);
      barRects += `<rect x="${barX}" y="${y}" width="${barW}" height="${h.toFixed(0)}" rx="${rx}" fill="${color}"/>`;
    }
  }

  const progressW = artSize;
  const progressFilled = showProgress ? (progressW * progressPct / 100).toFixed(1) : 0;
  const progressSvg = showProgress
    ? `<rect x="${artX}" y="${artistY2 + 8}" width="${progressW}" height="3" rx="1.5" fill="${artistColor}" opacity="0.2"/>` +
      `<rect x="${artX}" y="${artistY2 + 8}" width="${progressFilled}" height="3" rx="1.5" fill="${progressColor}"/>`
    : '';

  const logoScale = artSize / 64;
  const leftEl = albumDataUrl
    ? `<defs><clipPath id="ac"><rect x="${artX}" y="${artY}" width="${artSize}" height="${artSize}" rx="10"/></clipPath></defs>` +
      `<image href="${albumDataUrl}" x="${artX}" y="${artY}" width="${artSize}" height="${artSize}" clip-path="url(#ac)"/>`
    : `<g transform="translate(${artX}, ${artY}) scale(${logoScale})">` +
      `<path d="M32 0C14.3 0 0 14.337 0 32c0 17.7 14.337 32 32 32 17.7 0 32-14.337 32-32S49.663 0 32 0zm14.68 46.184c-.573.956-1.797 1.223-2.753.65-7.532-4.588-16.975-5.62-28.14-3.097-1.07.23-2.14-.42-2.37-1.49s.42-2.14 1.49-2.37c12.196-2.79 22.67-1.606 31.082 3.556a2 2 0 0 1 .688 2.753zm3.9-8.717c-.726 1.185-2.256 1.53-3.44.84-8.602-5.276-21.716-6.805-31.885-3.747-1.338.382-2.714-.344-3.097-1.644-.382-1.338.344-2.714 1.682-3.097 11.622-3.517 26.074-1.835 35.976 4.244 1.147.688 1.49 2.217.765 3.403zm.344-9.1c-10.323-6.117-27.336-6.69-37.2-3.708-1.568.497-3.25-.42-3.747-1.988s.42-3.25 1.988-3.747c11.317-3.44 30.127-2.753 41.98 4.282 1.415.84 1.873 2.676 1.032 4.09-.765 1.453-2.638 1.912-4.053 1.07z" fill="${logoColor}"/>` +
      `</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="12" fill="${cardBg}"/>
  ${leftEl}
  <text x="${cx}" y="${songY}" text-anchor="middle" font-family="system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif" font-size="15" font-weight="700" fill="${escXML(songColor)}">${escXML(song)}</text>
  <text x="${cx}" y="${artistY2}" text-anchor="middle" font-family="system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif" font-size="12" fill="${escXML(artistColor)}">${escXML(artist)}</text>
  ${progressSvg}
  ${barRects}
</svg>`;
}

function update() {
  document.getElementById('progressSettings').style.display =
    document.getElementById('showProgress').checked ? 'block' : 'none';

  const svg = cardLayout === 'square' ? buildSquareSVG() : buildSVG();
  const previewSvg = svg.replace(/(<svg[^>]*)\swidth="\d+"/, '$1 width="100%"');
  document.getElementById('previewContent').innerHTML = `<div style="width:100%;overflow:hidden">${previewSvg}</div>`;

  const link = document.getElementById('linkUrl').value.trim();
  const b64 = btoa(unescape(encodeURIComponent(svg)));
  const imgMd = `![Spotify Widget](data:image/svg+xml;base64,${b64})`;
  document.getElementById('codeOutput').textContent = link ? `[${imgMd}](${link})` : imgMd;
}

function setLayout(layout) {
  cardLayout = layout;
  document.querySelectorAll('[data-layout]').forEach(b => b.classList.toggle('active', b.dataset.layout === layout));
  update();
}

function setBarColorMode(mode) {
  barColorMode = mode;
  document.querySelectorAll('[data-barcm]').forEach(b => b.classList.toggle('active', b.dataset.barcm === mode));
  document.getElementById('barSolidSection').style.display = mode === 'solid' ? '' : 'none';
  document.getElementById('barGradSection').style.display = mode === 'gradient' ? '' : 'none';
  update();
}

function setBarShape(shape) {
  barShape = shape;
  document.querySelectorAll('[data-shape]').forEach(b => b.classList.toggle('active', b.dataset.shape === shape));
  update();
}

function setPlayerState(ps) {
  playerState = ps;
  document.querySelectorAll('[data-pstate]').forEach(b => b.classList.toggle('active', b.dataset.pstate === ps));
  update();
}

function bindColorHex(pickerId, hexId) {
  const picker = document.getElementById(pickerId);
  const hex = document.getElementById(hexId);
  picker.addEventListener('input', () => { hex.value = picker.value; update(); });
  hex.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) { picker.value = hex.value; update(); }
  });
}

// Toggle buttons
document.querySelectorAll('[data-layout]').forEach(b => b.addEventListener('click', () => setLayout(b.dataset.layout)));
document.querySelectorAll('[data-barcm]').forEach(b => b.addEventListener('click', () => setBarColorMode(b.dataset.barcm)));
document.querySelectorAll('[data-shape]').forEach(b => b.addEventListener('click', () => setBarShape(b.dataset.shape)));
document.querySelectorAll('[data-pstate]').forEach(b => b.addEventListener('click', () => setPlayerState(b.dataset.pstate)));

// Color pickers
['cardBg', 'songColor', 'artistColor', 'logoColor', 'barColor', 'barGradStart', 'barGradEnd', 'progressColor'].forEach(id => {
  bindColorHex(id, id + 'Hex');
});

// Text inputs
['songName', 'artistName', 'linkUrl'].forEach(id => {
  document.getElementById(id).addEventListener('input', update);
});

document.getElementById('barCount').addEventListener('input', update);
document.getElementById('showProgress').addEventListener('change', update);
document.getElementById('progressPct').addEventListener('input', e => {
  document.getElementById('progressValue').textContent = e.target.value + '%';
  update();
});

document.getElementById('clearAlbum').addEventListener('click', () => {
  albumDataUrl = null;
  document.getElementById('albumUpload').value = '';
  document.getElementById('clearAlbum').style.display = 'none';
  update();
});

document.getElementById('albumUpload').addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    if (file.type === 'image/gif') {
      albumDataUrl = e.target.result;
      document.getElementById('clearAlbum').style.display = '';
      update();
    } else {
      const img = new Image();
      img.onload = function () {
        const canvas = document.getElementById('resizeCanvas');
        const ctx = canvas.getContext('2d');
        const size = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 88, 88);
        albumDataUrl = canvas.toDataURL('image/png');
        document.getElementById('clearAlbum').style.display = '';
        update();
      };
      img.src = e.target.result;
    }
  };
  reader.readAsDataURL(file);
});

document.getElementById('copyBtn').addEventListener('click', copyFromOutput);

update();
