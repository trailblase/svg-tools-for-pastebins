import '../shared/components.js';
const S = {
  mode: 'simple',
  bStyle: 'solid',
  bColor: '#000000',
  bW: [2, 2, 2, 2],
  bWUnit: 'px',
  bR: [0, 0, 0, 0],
  bRUnit: 'px',
  imgSrc: null,
  imgBlob: null,
  imgUrlVal: '',
  slice: [33, 33, 33, 33],
  sliceFill: false,
  iW: [30, 30, 30, 30],
  iWUnit: 'px',
  iO: [0, 0, 0, 0],
  iOUnit: 'px',
  sliceUnit: '%',
  repeat: 'stretch',
  shadowOn: false,
  shColor: '#000000',
  shX: 0,
  shY: 4,
  shBl: 10,
  shSp: 5,
  pw: 320,
  ph: 180,
  link: { bW: true, bR: true, iW: true, iO: true },
  previewDark: false,
};

const LIMITS = {
  bW:    { px: 40,  '%': 15,  rem: 4,  vh: 5,  hw: 5  },
  bR:    { px: 200, '%': 50,  rem: 30, vh: 40, hw: 40 },
  iW:    { px: 30,  '%': 100, '': 20  },
  iO:    { px: 30,  '': 20   },
  slice: { '%': 100, '': 20  },
};
const INT_UNITS = new Set(['px', '']);

const $ = id => document.getElementById(id);
const previewBox   = $('previewBox');
const previewOuter = $('previewOuter');
const codeOutput   = $('codeOutput');
const canvas       = $('sliceCanvas');
const ctx          = canvas.getContext('2d');

function compact4(vals, unit) {
  const [t, r, b, l] = vals.map(n => `${n}${unit}`);
  if (t === r && r === b && b === l) return t;
  if (t === b && r === l) return `${t} ${r}`;
  if (r === l) return `${t} ${r} ${b}`;
  return `${t} ${r} ${b} ${l}`;
}

function compact4pct(vals) {
  return compact4(vals, '%');
}

function sliceStr(vals, fill, unit = '%') {
  const base = compact4(vals, unit);
  if (!fill) return base;
  const tokens = base.split(' ').length;
  if (tokens < 4) return `${base} fill`;
  const [t, r, b] = vals;
  return `${compact4([t, r, b, r], unit)} fill`;
}

function updateSideMax(grp, unit) {
  const max  = LIMITS[grp]?.[unit] ?? 20;
  const step = INT_UNITS.has(unit) ? 1 : 0.1;
  const arr  = grp === 'bW' ? S.bW : grp === 'bR' ? S.bR : grp === 'iW' ? S.iW : S.iO;
  document.querySelectorAll(`.side-inp[data-grp="${grp}"]`).forEach((el, i) => {
    el.max  = max;
    el.step = step;
    if (+el.value > max) { el.value = max; arr[i] = max; }
  });
}

function updateSliceUnit(unit) {
  S.sliceUnit = unit;
  const max = LIMITS.slice[unit] ?? 100;
  ['sliceT', 'sliceR', 'sliceB', 'sliceL'].forEach((id, i) => {
    const el = $(id);
    el.max = max;
    if (S.slice[i] > max) { S.slice[i] = max; el.value = max; }
  });
  syncSliceUI();
  update();
}

function renderPreview() {
  previewBox.style.width  = S.pw + 'px';
  previewBox.style.height = S.ph + 'px';

  previewBox.style.border       = '';
  previewBox.style.borderStyle  = '';
  previewBox.style.borderWidth  = '';
  previewBox.style.borderColor  = '';
  previewBox.style.borderImage  = '';
  previewBox.style.borderRadius = '';
  previewBox.style.boxShadow    = '';

  if (S.mode === 'simple') {
    previewBox.style.borderWidth  = compact4(S.bW, S.bWUnit);
    previewBox.style.borderStyle  = S.bStyle;
    previewBox.style.borderColor  = S.bColor;
    previewBox.style.borderRadius = compact4(S.bR, S.bRUnit);
  } else {
    previewBox.style.borderStyle = 'solid';
    previewBox.style.borderWidth = compact4(S.iW, S.iWUnit);
    if (S.imgSrc) {
      const width  = compact4(S.iW, S.iWUnit);
      const outset = compact4(S.iO, S.iOUnit);
      previewBox.style.borderImage = `url(${S.imgSrc}) ${sliceStr(S.slice, S.sliceFill, S.sliceUnit)} / ${width} / ${outset} ${S.repeat}`;
    }
  }

  if (S.shadowOn) {
    previewBox.style.boxShadow = `${S.shX}px ${S.shY}px ${S.shBl}px ${S.shSp}px ${S.shColor}`;
  }
}

let canvasBmp = null;

function renderSlice() {
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (!canvasBmp) {
    const sq = 12;
    for (let y = 0; y < H; y += sq) {
      for (let x = 0; x < W; x += sq) {
        ctx.fillStyle = (((x / sq) + (y / sq)) % 2 === 0) ? '#ccc' : '#e8e8e8';
        ctx.fillRect(x, y, sq, sq);
      }
    }
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.font = '13px "Share Tech", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Paste URL or upload an image', W / 2, H / 2 - 8);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '11px "Share Tech", sans-serif';
    ctx.fillText('above to use the slice editor', W / 2, H / 2 + 10);
    return;
  }

  ctx.drawImage(canvasBmp, 0, 0, W, H);

  const tY = (S.slice[0] / 100) * H;
  const rX = W - (S.slice[1] / 100) * W;
  const bY = H - (S.slice[2] / 100) * H;
  const lX = (S.slice[3] / 100) * W;

  if (!S.sliceFill) {
    ctx.fillStyle = 'rgba(0,0,0,0.42)';
    ctx.fillRect(lX, tY, rX - lX, bY - tY);
  }

  ctx.fillStyle = 'rgba(255,220,50,0.2)';
  ctx.fillRect(0, 0, lX, tY);
  ctx.fillRect(rX, 0, W - rX, tY);
  ctx.fillRect(0, bY, lX, H - bY);
  ctx.fillRect(rX, bY, W - rX, H - bY);

  ctx.strokeStyle = '#ffdd00';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  [[0, tY, W, tY], [0, bY, W, bY], [lX, 0, lX, H], [rX, 0, rX, H]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  });
  ctx.setLineDash([]);

  ctx.fillStyle = '#ffdd00';
  ctx.font = '10px "Courier New", monospace';
  ctx.textAlign = 'left';  ctx.fillText(`T:${S.slice[0]}%`, 3, tY - 3);
  ctx.textAlign = 'right'; ctx.fillText(`B:${S.slice[2]}%`, W - 3, bY - 3);
  ctx.textAlign = 'left';  ctx.fillText(`L:${S.slice[3]}%`, lX + 3, H - 3);
  ctx.textAlign = 'right'; ctx.fillText(`R:${S.slice[1]}%`, rX - 3, 12);
}

function syncSliceUI() {
  [['sliceT', 'sliceTv', 0], ['sliceR', 'sliceRv', 1], ['sliceB', 'sliceBv', 2], ['sliceL', 'sliceLv', 3]]
    .forEach(([id, vid, i]) => {
      $(id).value = S.slice[i];
      $(vid).textContent = S.slice[i] + '%';
    });
}

function loadImage(src) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    createImageBitmap(img)
      .then(bmp  => { canvasBmp = bmp; S.imgSrc = src; update(); })
      .catch(() => { canvasBmp = null; S.imgSrc = src; update(); });
  };
  img.onerror = () => { canvasBmp = null; S.imgSrc = null; update(); };
  img.src = src;
}

function update() {
  renderSlice();
  renderPreview();
  renderCode();
}

const HIT = 6;
let dragging = null;

function canvasCoords(e) {
  const r  = canvas.getBoundingClientRect();
  const sx = canvas.width  / r.width;
  const sy = canvas.height / r.height;
  return [(e.clientX - r.left) * sx, (e.clientY - r.top) * sy];
}

function slicePixels() {
  const W = canvas.width, H = canvas.height;
  return {
    T: (S.slice[0] / 100) * H,
    R: W - (S.slice[1] / 100) * W,
    B: H - (S.slice[2] / 100) * H,
    L: (S.slice[3] / 100) * W,
  };
}

canvas.addEventListener('mousedown', e => {
  if (!canvasBmp) return;
  const [cx, cy] = canvasCoords(e);
  const p = slicePixels();
  if      (Math.abs(cy - p.T) < HIT) dragging = 'T';
  else if (Math.abs(cy - p.B) < HIT) dragging = 'B';
  else if (Math.abs(cx - p.L) < HIT) dragging = 'L';
  else if (Math.abs(cx - p.R) < HIT) dragging = 'R';
  if (dragging) e.preventDefault();
});

window.addEventListener('mousemove', e => {
  if (!canvasBmp) return;
  const [cx, cy] = canvasCoords(e);
  if (!dragging) {
    const p = slicePixels();
    const nearH = Math.abs(cy - p.T) < HIT || Math.abs(cy - p.B) < HIT;
    const nearV = Math.abs(cx - p.L) < HIT || Math.abs(cx - p.R) < HIT;
    canvas.style.cursor = (nearH && nearV) ? 'move' : nearH ? 'ns-resize' : nearV ? 'ew-resize' : 'crosshair';
    return;
  }
  const W = canvas.width, H = canvas.height;
  const rx = Math.max(0, Math.min(W, cx));
  const ry = Math.max(0, Math.min(H, cy));
  if (dragging === 'T') S.slice[0] = Math.round((ry / H) * 100);
  if (dragging === 'B') S.slice[2] = Math.round(((H - ry) / H) * 100);
  if (dragging === 'L') S.slice[3] = Math.round((rx / W) * 100);
  if (dragging === 'R') S.slice[1] = Math.round(((W - rx) / W) * 100);
  syncSliceUI();
  update();
});

window.addEventListener('mouseup', () => { dragging = null; });

function renderCode() {
  const lines = [];

  if (S.mode === 'simple') {
    lines.push(`CONTAINER_BORDER_WIDTH = ${compact4(S.bW, S.bWUnit)}`);
    lines.push(`CONTAINER_BORDER_STYLE = ${S.bStyle}`);
    lines.push(`CONTAINER_BORDER_COLOR = ${S.bColor.toUpperCase()}`);
    if (S.bR.some(v => v !== 0)) lines.push(`CONTAINER_BORDER_RADIUS = ${compact4(S.bR, S.bRUnit)}`);
  } else {
    const src = S.imgUrlVal.trim();
    if (src) {
      lines.push(`CONTAINER_BORDER_IMAGE = ${src}`);
    } else if (S.imgBlob) {
      lines.push(`CONTAINER_BORDER_IMAGE = (paste-your-hosted-url-here)`);
    }
    lines.push(`CONTAINER_BORDER_IMAGE_SLICE = ${sliceStr(S.slice, S.sliceFill, S.sliceUnit)}`);
    lines.push(`CONTAINER_BORDER_IMAGE_WIDTH = ${compact4(S.iW, S.iWUnit)}`);
    const outset = compact4(S.iO, S.iOUnit);
    if (S.iO.some(v => v !== 0)) lines.push(`CONTAINER_BORDER_IMAGE_OUTSET = ${outset}`);
    lines.push(`CONTAINER_BORDER_IMAGE_REPEAT = ${S.repeat}`);
  }

  if (S.shadowOn) {
    lines.push(`CONTAINER_BOX_SHADOW = ${S.shX}px ${S.shY}px ${S.shBl}px ${S.shSp}px ${S.shColor.toUpperCase()}`);
  }

  codeOutput.textContent = lines.join('\n');
}

function handleSide(grp, i, rawVal, arr) {
  const n = Math.max(0, parseFloat(rawVal) || 0);
  if (S.link[grp]) {
    arr.fill(n);
    document.querySelectorAll(`.side-inp[data-grp="${grp}"]`).forEach(el => { el.value = n; });
  } else {
    arr[i] = n;
  }
  renderPreview();
  renderCode();
}

function bindColor(pickId, hexId, cb) {
  const pick = $(pickId), hex = $(hexId);
  pick.addEventListener('input', () => { hex.value = pick.value.toUpperCase(); cb(pick.value); });
  hex.addEventListener('change', () => {
    const v = hex.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) { pick.value = v; cb(v); }
  });
}

function initEvents() {

  // Mode
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.mode = btn.dataset.mode;
      $('simplePanel').style.display = S.mode === 'simple' ? '' : 'none';
      $('imagePanel').style.display  = S.mode === 'image'  ? '' : 'none';
      renderPreview(); renderCode();
    });
  });

  // Border style
  document.querySelectorAll('[data-style]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-style]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      S.bStyle = btn.dataset.style;
      renderPreview(); renderCode();
    });
  });

  bindColor('bColor', 'bColorHex', v => { S.bColor = v; renderPreview(); renderCode(); });

  document.querySelectorAll('.side-inp').forEach(el => {
    el.addEventListener('input', () => {
      const grp = el.dataset.grp;
      const i   = +el.dataset.i;
      const arr = grp === 'bW' ? S.bW : grp === 'bR' ? S.bR : grp === 'iW' ? S.iW : S.iO;
      handleSide(grp, i, el.value, arr);
    });
  });

  // Slice unit toggle
  document.querySelectorAll('[data-slice-unit]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-slice-unit]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateSliceUnit(btn.dataset.sliceUnit);
    });
  });

  // Unit selects
  document.querySelector('[data-unit="bW"]').addEventListener('change', e => {
    S.bWUnit = e.target.value; updateSideMax('bW', S.bWUnit); renderPreview(); renderCode();
  });
  document.querySelector('[data-unit="bR"]').addEventListener('change', e => {
    S.bRUnit = e.target.value; updateSideMax('bR', S.bRUnit); renderPreview(); renderCode();
  });
  document.querySelector('[data-unit="iW"]').addEventListener('change', e => {
    S.iWUnit = e.target.value; updateSideMax('iW', S.iWUnit); renderPreview(); renderCode();
  });
  document.querySelector('[data-unit="iO"]').addEventListener('change', e => {
    S.iOUnit = e.target.value; updateSideMax('iO', S.iOUnit); renderPreview(); renderCode();
  });

  // Link buttons
  document.querySelectorAll('[data-link]').forEach(btn => {
    btn.addEventListener('click', () => {
      const grp = btn.dataset.link;
      S.link[grp] = !S.link[grp];
      btn.classList.toggle('on', S.link[grp]);
      if (S.link[grp]) {
        const arr = grp === 'bW' ? S.bW : grp === 'bR' ? S.bR : grp === 'iW' ? S.iW : S.iO;
        arr.fill(arr[0]);
        document.querySelectorAll(`.side-inp[data-grp="${grp}"]`).forEach(el => { el.value = arr[0]; });
        renderPreview(); renderCode();
      }
    });
  });

  $('imgUrl').addEventListener('input', e => {
    const v = e.target.value.trim();
    S.imgUrlVal = v;
    if (v) {
      if (S.imgBlob) { URL.revokeObjectURL(S.imgBlob); S.imgBlob = null; }
      $('imgUpload').value = '';
      $('imgClear').style.display = 'inline-block';
      loadImage(v);
    } else {
      S.imgSrc = null; canvasBmp = null; $('imgClear').style.display = 'none'; update();
    }
  });

  $('imgUpload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (S.imgBlob) URL.revokeObjectURL(S.imgBlob);
    S.imgBlob = URL.createObjectURL(file);
    S.imgUrlVal = '';
    $('imgUrl').value = '';
    $('imgClear').style.display = 'inline-block';
    loadImage(S.imgBlob);
  });

  $('imgClear').addEventListener('click', () => {
    if (S.imgBlob) { URL.revokeObjectURL(S.imgBlob); S.imgBlob = null; }
    S.imgSrc = null; S.imgUrlVal = ''; canvasBmp = null;
    $('imgUrl').value = ''; $('imgUpload').value = '';
    $('imgClear').style.display = 'none';
    update();
  });

  [['sliceT','sliceTv',0],['sliceR','sliceRv',1],['sliceB','sliceBv',2],['sliceL','sliceLv',3]].forEach(([id,vid,i]) => {
    $(id).addEventListener('input', e => {
      S.slice[i] = +e.target.value;
      $(vid).textContent = S.slice[i] + '%';
      update();
    });
  });

  $('sliceFill').addEventListener('change', e => { S.sliceFill = e.target.checked; update(); });

  document.querySelectorAll('[data-repeat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-repeat]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      S.repeat = btn.dataset.repeat;
      renderPreview(); renderCode();
    });
  });

  $('shadowOn').addEventListener('change', e => {
    S.shadowOn = e.target.checked;
    $('shadowPanel').style.display = S.shadowOn ? '' : 'none';
    renderPreview(); renderCode();
  });
  bindColor('shColor', 'shColorHex', v => { S.shColor = v; renderPreview(); renderCode(); });
  [['shX','shXv','shX'],['shY','shYv','shY'],['shSp','shSpv','shSp'],['shBl','shBlv','shBl']].forEach(([id,vid,key]) => {
    $(id).addEventListener('input', e => { S[key] = +e.target.value; $(vid).textContent = S[key]+'px'; renderPreview(); renderCode(); });
  });

  $('pw').addEventListener('input', e => { S.pw = +e.target.value; $('pwv').textContent = S.pw+'px'; renderPreview(); });
  $('ph').addEventListener('input', e => { S.ph = +e.target.value; $('phv').textContent = S.ph+'px'; renderPreview(); });

  $('previewThemeBtn').addEventListener('click', () => {
    S.previewDark = !S.previewDark;
    previewOuter.classList.toggle('dark-bg', S.previewDark);
    $('previewThemeBtn').textContent = S.previewDark ? '[L]' : '[D]';
  });

  // Copy
  $('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(codeOutput.textContent).then(() => {
      const btn = $('copyBtn');
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy Code'; btn.classList.remove('copied'); }, 1500);
    });
  });
}

initEvents();
renderSlice();
renderPreview();
renderCode();
