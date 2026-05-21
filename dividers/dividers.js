import { lightenColor } from '../shared/color.js';
import '../shared/components.js';
import { copyFromOutput } from '../shared/persistence.js';

const state = {
  type: 'simple',
  color: '#4099a0',
  glowColor: '#9ecfd2',
  thickness: 4,
  width: 100,
  faded: false,
  musicStyle: 'bottom'
};

const THICKNESS_RANGES = {
  simple: [1, 20, 4],
  double: [1,  6, 1],
  zigzag: [1,  5, 1],
};

function setType(type) {
  state.type = type;
  document.querySelectorAll('[data-type]').forEach(el => {
    el.classList.toggle('selected', el.dataset.type === type);
  });

  const isHeartbeat = type === 'heartbeat' || type === 'heartbeat-loop';
  const hasThickness = type in THICKNESS_RANGES;
  const hasWidth     = type === 'simple' || type === 'double' || type === 'zigzag';
  const hasFaded     = type === 'simple' || type === 'double';

  if (hasThickness) {
    const [min, max, def] = THICKNESS_RANGES[type];
    const slider = document.getElementById('thicknessSlider');
    slider.min = min; slider.max = max;
    if (state.thickness > max) {
      state.thickness = def;
      slider.value = def;
      document.getElementById('thicknessVal').textContent = def + 'px';
    }
  }

  if (isHeartbeat) {
    state.glowColor = lightenColor(state.color, 60);
    document.getElementById('glowPicker').value = state.glowColor;
    document.getElementById('glowHexInput').value = state.glowColor.toUpperCase();
  }

  document.getElementById('thicknessPanel').style.display  = hasThickness  ? '' : 'none';
  document.getElementById('widthPanel').style.display      = hasWidth      ? '' : 'none';
  document.getElementById('fadedPanel').style.display      = hasFaded      ? '' : 'none';
  document.getElementById('glowPanel').style.display       = isHeartbeat   ? '' : 'none';
  document.getElementById('musicStylePanel').style.display = type === 'music' ? '' : 'none';
  generate();
}

function setColor(val) {
  state.color = val;
  document.getElementById('hexInput').value = val.toUpperCase();
  generate();
}

function setHexColor(val) {
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    state.color = val;
    document.getElementById('colorPicker').value = val;
    generate();
  }
}

function setGlowColor(val) {
  state.glowColor = val;
  document.getElementById('glowHexInput').value = val.toUpperCase();
  generate();
}

function setHexGlowColor(val) {
  if (/^#[0-9a-fA-F]{6}$/.test(val)) {
    state.glowColor = val;
    document.getElementById('glowPicker').value = val;
    generate();
  }
}

function setThickness(val) {
  state.thickness = parseInt(val);
  document.getElementById('thicknessVal').textContent = val + 'px';
  generate();
}

function setWidth(val) {
  state.width = parseInt(val);
  document.getElementById('widthVal').textContent = val + '%';
  generate();
}

function setFaded(checked) {
  state.faded = checked;
  generate();
}

function setMusicStyle(style) {
  state.musicStyle = style;
  document.querySelectorAll('[data-mstyle]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mstyle === style);
  });
  generate();
}

function gradientDefs(id, c) {
  return `<defs><linearGradient id='${id}' x1='0%25' x2='100%25'>`
    + `<stop offset='0' stop-color='${c}' stop-opacity='0'/>`
    + `<stop offset='0.5' stop-color='${c}' stop-opacity='1'/>`
    + `<stop offset='1' stop-color='${c}' stop-opacity='0'/>`
    + `</linearGradient></defs>`;
}
function gradientDefsPreview(id, c) {
  return `<defs><linearGradient id='${id}' x1='0%' x2='100%'>`
    + `<stop offset='0' stop-color='${c}' stop-opacity='0'/>`
    + `<stop offset='0.5' stop-color='${c}' stop-opacity='1'/>`
    + `<stop offset='1' stop-color='${c}' stop-opacity='0'/>`
    + `</linearGradient></defs>`;
}

function zigzagPath(t) {
  const pad  = Math.ceil(t / 2);
  const yTop = pad;
  const yBot = pad + 4;
  const yMid = pad + 2;
  const h    = yBot + pad;
  let d = `M0,${yMid}`;
  for (let x = 5; x <= 100; x += 10) {
    d += ` L${x},${yTop} L${x + 5},${yBot}`;
  }
  return { d, h };
}

const MUSIC_PATTERNS = [
  [5,35,12,28,8,35],   [20,50,8,40,15,50],  [35,10,55,20,45,10],
  [50,20,65,30,55,20], [60,25,40,55,15,25], [45,65,20,50,35,65],
  [30,55,10,45,25,55], [55,15,70,25,60,15], [20,60,35,55,10,60],
  [40,10,60,20,50,10], [65,30,45,60,20,30], [25,55,15,50,30,55],
];
const MUSIC_DURATIONS = [1.2,0.9,1.1,0.8,1.3,0.7,1.0,0.85,1.15,0.95,1.05,0.75];

function buildMusicBars(fillAttr, centered) {
  let bars = '';
  for (let i = 0; i < 58; i++) {
    const x   = 10 + i * 10;
    const dur = MUSIC_DURATIONS[i % MUSIC_DURATIONS.length];
    const pat = MUSIC_PATTERNS[i % MUSIC_PATTERNS.length];
    const off = i % pat.length;
    const h   = [...pat.slice(off), ...pat.slice(0, off)];
    const y   = h.map(v => centered ? (40 - Math.floor(v / 2)) : (80 - v));
    bars += `<rect x='${x}' y='40' width='6' height='0' fill='${fillAttr}'>`
      + `<animate attributeName='height' values='${h.join(';')}' dur='${dur}s' repeatCount='indefinite'/>`
      + `<animate attributeName='y' values='${y.join(';')}' dur='${dur}s' repeatCount='indefinite'/>`
      + `</rect>`;
  }
  return bars;
}

function generate() {
  const { type, color, glowColor, thickness: t, width, faded, musicStyle } = state;
  const c  = color.slice(1).toUpperCase();
  const gc = glowColor.slice(1).toUpperCase();
  const wStr = width + '%';
  let previewHtml = '';
  let rentryCode  = '';

  if (type === 'simple') {
    if (faded) {
      previewHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${wStr}" height="${t}" style="display:block">`
        + gradientDefsPreview('dg', color)
        + `<rect width="100%" height="${t}" fill="url(#dg)"/></svg>`;
      rentryCode = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='${t}'>`
        + gradientDefs('g', '%23' + c)
        + `<rect width='800' height='${t}' fill='url%28%23g%29'/></svg>){${wStr}:${t}}`;
    } else {
      previewHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${wStr}" height="${t}" style="display:block"><rect width="100%" height="${t}" fill="${color}"/></svg>`;
      rentryCode  = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='${t}'><rect width='800' height='${t}' fill='%23${c}'/></svg>){${wStr}:${t}}`;
    }

  } else if (type === 'double') {
    const svgH = 2 * t + 6;
    const y2   = t + 4;
    if (faded) {
      previewHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${wStr}" height="${svgH}" style="display:block">`
        + gradientDefsPreview('dfg', color)
        + `<rect y="2" width="100%" height="${t}" fill="url(#dfg)"/>`
        + `<rect y="${y2}" width="100%" height="${t}" fill="url(#dfg)"/></svg>`;
      rentryCode = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='${svgH}'>`
        + gradientDefs('g', '%23' + c)
        + `<rect y='2' width='800' height='${t}' fill='url%28%23g%29'/>`
        + `<rect y='${y2}' width='800' height='${t}' fill='url%28%23g%29'/></svg>){${wStr}:${svgH}}`;
    } else {
      previewHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${wStr}" height="${svgH}" style="display:block">`
        + `<rect y="2" width="100%" height="${t}" fill="${color}"/>`
        + `<rect y="${y2}" width="100%" height="${t}" fill="${color}"/></svg>`;
      rentryCode = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='${svgH}'>`
        + `<rect y='2' width='800' height='${t}' fill='%23${c}'/>`
        + `<rect y='${y2}' width='800' height='${t}' fill='%23${c}'/></svg>){${wStr}:${svgH}}`;
    }

  } else if (type === 'zigzag') {
    const { d, h } = zigzagPath(t);
    previewHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="${wStr}" height="${h}" viewBox="0 0 100 ${h}" preserveAspectRatio="none" style="display:block">`
      + `<path d="${d}" stroke="${color}" stroke-width="${t}" fill="none" stroke-linejoin="round"/></svg>`;
    rentryCode = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='${h}' viewBox='0 0 100 ${h}' preserveAspectRatio='none'>`
      + `<path d='${d}' stroke='%23${c}' stroke-width='${t}' fill='none' stroke-linejoin='round'/></svg>){${wStr}:${h}}`;

  } else if (type === 'heartbeat') {
    previewHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 80" width="100%" style="display:block">`
      + `<defs><filter id="hbglow"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter></defs>`
      + `<polyline points="0,40 60,40 80,40 95,8 105,72 115,20 125,58 135,40 600,40" fill="none" stroke="${color}" stroke-width="3" filter="url(#hbglow)" stroke-dasharray="700" stroke-dashoffset="700">`
      + `<animate attributeName="stroke-dashoffset" values="700;0;0;700" keyTimes="0;0.45;0.75;1" dur="2s" repeatCount="indefinite"/>`
      + `<animate attributeName="opacity" values="1;1;0.9;1;0.7;1;0.85;1" keyTimes="0;0.45;0.5;0.55;0.6;0.65;0.7;0.75" dur="2s" repeatCount="indefinite"/>`
      + `</polyline>`
      + `<polyline points="0,40 60,40 80,40 95,8 105,72 115,20 125,58 135,40 600,40" fill="none" stroke="${glowColor}" stroke-width="1" opacity="0.4" stroke-dasharray="700" stroke-dashoffset="700">`
      + `<animate attributeName="stroke-dashoffset" values="700;0;0;700" keyTimes="0;0.45;0.75;1" dur="2s" repeatCount="indefinite"/>`
      + `</polyline></svg>`;
    rentryCode = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='80'>`
      + `<defs><filter id='glow'><feGaussianBlur stdDeviation='3' result='blur'/><feComposite in='SourceGraphic' in2='blur' operator='over'/></filter></defs>`
      + `<polyline points='0,40 60,40 80,40 95,8 105,72 115,20 125,58 135,40 600,40' fill='none' stroke='%23${c}' stroke-width='3' filter='url%28%23glow%29' stroke-dasharray='700' stroke-dashoffset='700'>`
      + `<animate attributeName='stroke-dashoffset' values='700;0;0;700' keyTimes='0;0.45;0.75;1' dur='2s' repeatCount='indefinite'/>`
      + `<animate attributeName='opacity' values='1;1;0.9;1;0.7;1;0.85;1' keyTimes='0;0.45;0.5;0.55;0.6;0.65;0.7;0.75' dur='2s' repeatCount='indefinite'/>`
      + `</polyline>`
      + `<polyline points='0,40 60,40 80,40 95,8 105,72 115,20 125,58 135,40 600,40' fill='none' stroke='%23${gc}' stroke-width='1' opacity='0.4' stroke-dasharray='700' stroke-dashoffset='700'>`
      + `<animate attributeName='stroke-dashoffset' values='700;0;0;700' keyTimes='0;0.45;0.75;1' dur='2s' repeatCount='indefinite'/>`
      + `</polyline></svg>){100%:30}`;

  } else if (type === 'heartbeat-loop') {
    previewHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 80" width="100%" style="display:block">`
      + `<defs><filter id="hbglow2"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter></defs>`
      + `<polyline points="0,40 60,40 80,40 95,8 105,72 115,20 125,58 135,40 600,40" fill="none" stroke="${color}" stroke-width="3" filter="url(#hbglow2)" stroke-dasharray="120 580" stroke-dashoffset="700">`
      + `<animate attributeName="stroke-dashoffset" values="700;0" dur="2s" repeatCount="indefinite"/>`
      + `<animate attributeName="opacity" values="1;0.85;1;0.7;1;0.9;1" dur="2s" repeatCount="indefinite"/>`
      + `</polyline>`
      + `<polyline points="0,40 60,40 80,40 95,8 105,72 115,20 125,58 135,40 600,40" fill="none" stroke="${glowColor}" stroke-width="1" opacity="0.4" stroke-dasharray="120 580" stroke-dashoffset="700">`
      + `<animate attributeName="stroke-dashoffset" values="700;0" dur="2s" repeatCount="indefinite"/>`
      + `</polyline></svg>`;
    rentryCode = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='80'>`
      + `<defs><filter id='glow'><feGaussianBlur stdDeviation='3' result='blur'/><feComposite in='SourceGraphic' in2='blur' operator='over'/></filter></defs>`
      + `<polyline points='0,40 60,40 80,40 95,8 105,72 115,20 125,58 135,40 600,40' fill='none' stroke='%23${c}' stroke-width='3' filter='url%28%23glow%29' stroke-dasharray='120 580' stroke-dashoffset='700'>`
      + `<animate attributeName='stroke-dashoffset' values='700;0' dur='2s' repeatCount='indefinite'/>`
      + `<animate attributeName='opacity' values='1;0.85;1;0.7;1;0.9;1' dur='2s' repeatCount='indefinite'/>`
      + `</polyline>`
      + `<polyline points='0,40 60,40 80,40 95,8 105,72 115,20 125,58 135,40 600,40' fill='none' stroke='%23${gc}' stroke-width='1' opacity='0.4' stroke-dasharray='120 580' stroke-dashoffset='700'>`
      + `<animate attributeName='stroke-dashoffset' values='700;0' dur='2s' repeatCount='indefinite'/>`
      + `</polyline></svg>){100%:30}`;

  } else if (type === 'music') {
    const centered = musicStyle === 'center';
    previewHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 80" width="100%" style="display:block">`
      + buildMusicBars(color, centered).replace(/'/g, '"')
      + `</svg>`;
    rentryCode = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='80'>`
      + buildMusicBars('%23' + c, centered)
      + `</svg>){100%:30}`;
  }

  document.getElementById('preview').innerHTML = previewHtml;
  document.getElementById('output').textContent = rentryCode;
}

document.querySelectorAll('[data-type]').forEach(btn => {
  btn.addEventListener('click', () => setType(btn.dataset.type));
});
document.querySelectorAll('[data-mstyle]').forEach(btn => {
  btn.addEventListener('click', () => setMusicStyle(btn.dataset.mstyle));
});
document.getElementById('colorPicker').addEventListener('input', e => setColor(e.target.value));
document.getElementById('hexInput').addEventListener('input', e => setHexColor(e.target.value));
document.getElementById('thicknessSlider').addEventListener('input', e => setThickness(e.target.value));
document.getElementById('widthSlider').addEventListener('input', e => setWidth(e.target.value));
document.getElementById('fadedCheck').addEventListener('change', e => setFaded(e.target.checked));
document.getElementById('glowPicker').addEventListener('input', e => setGlowColor(e.target.value));
document.getElementById('glowHexInput').addEventListener('input', e => setHexGlowColor(e.target.value));
document.getElementById('copyBtn').addEventListener('click', copyFromOutput);

generate();
