import { hexToRgbaEncoded, hexToRgba } from '../shared/color.js';
import '../shared/components.js';
import { copyFromOutput } from '../shared/persistence.js';

// fonts are loaded from fonts.json
let fonts = [];

let state = {
  text: 'Hello World',
  textMode: 'single',
  font: null,
  fontSize: 18,
  fontWeight: 400,
  textAlign: 'center',
  colorMode: 'solid',
  solidColor: '#ffffff',
  solidOpacity: 1,
  gradientStart: '#ff69b4',
  gradientEnd: '#00ffff',
  gradientDir: 'right',
  gradientOpacity: 1,
  effects: {
    bold: false,
    italic: false,
    blur: false
  },
  underline: {
    enabled: false,
    style: 'solid',
    color: '#ffffff',
    thickness: 2
  },
  overline: {
    enabled: false,
    style: 'solid',
    color: '#ffffff',
    thickness: 2
  },
  transform: {
    rotate: 0,
    flipH: false,
    flipV: false
  },
  glowEnabled: false,
  glowColor: '#ff69b4',
  glowSize: 5,
  glowOpacity: 1,
  shadowEnabled: false,
  shadowColor: '#000000',
  shadowOpacity: 0.5,
  shadowX: 2,
  shadowY: 2,
  shadowBlur: 3,
  outlineEnabled: false,
  outlineColor: '#ffffff',
  outlineWidth: 1,
  letterSpacing: 0,
  animation: 'none',
  animSpeed: 2,
  marqueeDir: 'rtl',
  marqueeFade: false
};

function initFontGrid() {
  const grid = document.getElementById('fontGrid');
  fonts.forEach((font, index) => {
    const option = document.createElement('div');
    option.className = 'font-option' + (index === 0 ? ' selected' : '');
    option.style.fontFamily = font.family;
    option.textContent = font.name;
    option.addEventListener('click', () => selectFont(index));
    grid.appendChild(option);
  });
}

function selectFont(index) {
  state.font = fonts[index];
  document.querySelectorAll('.font-option').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });
  updatePreview();
}

function setTextMode(mode) {
  state.textMode = mode;
  document.querySelectorAll('[data-mode]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  updatePreview();
}

function setColorMode(mode) {
  state.colorMode = mode;
  document.querySelectorAll('[data-color]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === mode);
  });
  document.getElementById('solidColorSection').style.display = mode === 'solid' ? 'block' : 'none';
  document.getElementById('gradientColorSection').style.display = mode === 'gradient' ? 'block' : 'none';
  updatePreview();
}

function setGradientDir(dir) {
  state.gradientDir = dir;
  document.querySelectorAll('.direction-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.dir === dir);
  });
  updatePreview();
}

function toggleEffect(effect) {
  state.effects[effect] = !state.effects[effect];
  document.querySelector(`[data-effect="${effect}"]`).classList.toggle('selected');
  updatePreview();
}

function setAnimation(anim) {
  state.animation = anim;
  document.querySelectorAll('.animation-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.anim === anim);
  });
  const dirRow = document.getElementById('marqueeDirRow');
  if (dirRow) dirRow.style.display = (anim === 'marquee') ? '' : 'none';
  updatePreview();
}

function setMarqueeDir(dir) {
  state.marqueeDir = dir;
  document.querySelectorAll('[data-mdir]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mdir === dir);
  });
  updatePreview();
}

function setTextAlign(align) {
  state.textAlign = align;
  document.querySelectorAll('[data-align]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.align === align);
  });
  updatePreview();
}

function toggleDecoration(type) {
  if (type === 'underline') {
    state.underline.enabled = document.getElementById('underlineEnabled').checked;
    document.getElementById('underlineSettings').classList.toggle('visible', state.underline.enabled);
  } else if (type === 'overline') {
    state.overline.enabled = document.getElementById('overlineEnabled').checked;
    document.getElementById('overlineSettings').classList.toggle('visible', state.overline.enabled);
  }
  updatePreview();
}

function setUnderlineStyle(style) {
  state.underline.style = style;
  document.querySelectorAll('.underline-style').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.ulstyle === style);
  });
  updatePreview();
}

function setOverlineStyle(style) {
  state.overline.style = style;
  document.querySelectorAll('.overline-style').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.olstyle === style);
  });
  updatePreview();
}

// requires some fixing later since some animations dont account for flipping
function toggleTransform(type) {
  state.transform[type] = !state.transform[type];
  document.querySelector(`[data-transform="${type}"]`).classList.toggle('selected');
  updatePreview();
}

function toggleGlow() {
  state.glowEnabled = document.getElementById('glowEnabled').checked;
  document.getElementById('glowSettings').classList.toggle('visible', state.glowEnabled);
  updatePreview();
}

function toggleShadow() {
  state.shadowEnabled = document.getElementById('shadowEnabled').checked;
  document.getElementById('shadowSettings').classList.toggle('visible', state.shadowEnabled);
  updatePreview();
}

function toggleOutline() {
  state.outlineEnabled = document.getElementById('outlineEnabled').checked;
  document.getElementById('outlineSettings').classList.toggle('visible', state.outlineEnabled);
  updatePreview();
}

function initEventListeners() {
  document.getElementById('textInput').addEventListener('input', (e) => {
    state.text = e.target.value;
    updatePreview();
  });

  document.getElementById('fontSize').addEventListener('input', (e) => {
    state.fontSize = parseInt(e.target.value) || 18;
    updatePreview();
  });

  document.getElementById('solidColor').addEventListener('input', (e) => {
    state.solidColor = e.target.value;
    document.getElementById('solidColorHex').value = e.target.value;
    updatePreview();
  });

  document.getElementById('solidColorHex').addEventListener('input', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      state.solidColor = e.target.value;
      document.getElementById('solidColor').value = e.target.value;
      updatePreview();
    }
  });

  document.getElementById('gradientStart').addEventListener('input', (e) => {
    state.gradientStart = e.target.value;
    document.getElementById('gradientStartHex').value = e.target.value;
    updatePreview();
  });

  document.getElementById('gradientStartHex').addEventListener('input', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      state.gradientStart = e.target.value;
      document.getElementById('gradientStart').value = e.target.value;
      updatePreview();
    }
  });

  document.getElementById('gradientEnd').addEventListener('input', (e) => {
    state.gradientEnd = e.target.value;
    document.getElementById('gradientEndHex').value = e.target.value;
    updatePreview();
  });

  document.getElementById('gradientEndHex').addEventListener('input', (e) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      state.gradientEnd = e.target.value;
      document.getElementById('gradientEnd').value = e.target.value;
      updatePreview();
    }
  });

  document.getElementById('solidOpacity').addEventListener('input', (e) => {
    state.solidOpacity = parseFloat(e.target.value);
    document.getElementById('solidOpacityValue').textContent = Math.round(state.solidOpacity * 100) + '%';
    updatePreview();
  });

  document.getElementById('gradientOpacity').addEventListener('input', (e) => {
    state.gradientOpacity = parseFloat(e.target.value);
    document.getElementById('gradientOpacityValue').textContent = Math.round(state.gradientOpacity * 100) + '%';
    updatePreview();
  });

  document.getElementById('glowEnabled').addEventListener('change', toggleGlow);

  document.getElementById('glowColor').addEventListener('input', (e) => {
    state.glowColor = e.target.value;
    updatePreview();
  });

  document.getElementById('glowSize').addEventListener('input', (e) => {
    state.glowSize = parseInt(e.target.value) || 5;
    updatePreview();
  });

  document.getElementById('glowOpacity').addEventListener('input', (e) => {
    state.glowOpacity = parseFloat(e.target.value);
    document.getElementById('glowOpacityValue').textContent = Math.round(state.glowOpacity * 100) + '%';
    updatePreview();
  });

  document.getElementById('shadowEnabled').addEventListener('change', toggleShadow);

  document.getElementById('shadowColor').addEventListener('input', (e) => {
    state.shadowColor = e.target.value;
    updatePreview();
  });

  document.getElementById('shadowBlur').addEventListener('input', (e) => {
    state.shadowBlur = parseInt(e.target.value) || 3;
    updatePreview();
  });

  document.getElementById('shadowOpacity').addEventListener('input', (e) => {
    state.shadowOpacity = parseFloat(e.target.value);
    document.getElementById('shadowOpacityValue').textContent = Math.round(state.shadowOpacity * 100) + '%';
    updatePreview();
  });

  document.getElementById('shadowX').addEventListener('input', (e) => {
    state.shadowX = parseInt(e.target.value) || 0;
    updatePreview();
  });

  document.getElementById('shadowY').addEventListener('input', (e) => {
    state.shadowY = parseInt(e.target.value) || 0;
    updatePreview();
  });

  document.getElementById('outlineEnabled').addEventListener('change', toggleOutline);

  document.getElementById('outlineColor').addEventListener('input', (e) => {
    state.outlineColor = e.target.value;
    updatePreview();
  });

  document.getElementById('outlineWidth').addEventListener('input', (e) => {
    state.outlineWidth = parseFloat(e.target.value) || 1;
    updatePreview();
  });

  document.getElementById('letterSpacing').addEventListener('input', (e) => {
    state.letterSpacing = parseInt(e.target.value);
    document.getElementById('spacingValue').textContent = state.letterSpacing + 'px';
    updatePreview();
  });

  document.getElementById('animSpeed').addEventListener('input', (e) => {
    state.animSpeed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = state.animSpeed + 's';
    updatePreview();
  });

  document.getElementById('fontWeight').addEventListener('change', (e) => {
    state.fontWeight = parseInt(e.target.value);
    updatePreview();
  });

  document.getElementById('underlineEnabled').addEventListener('change', () => toggleDecoration('underline'));
  document.getElementById('overlineEnabled').addEventListener('change', () => toggleDecoration('overline'));

  document.getElementById('underlineColor').addEventListener('input', (e) => {
    state.underline.color = e.target.value;
    updatePreview();
  });

  document.getElementById('underlineThickness').addEventListener('input', (e) => {
    state.underline.thickness = parseInt(e.target.value) || 2;
    updatePreview();
  });

  document.getElementById('overlineColor').addEventListener('input', (e) => {
    state.overline.color = e.target.value;
    updatePreview();
  });

  document.getElementById('overlineThickness').addEventListener('input', (e) => {
    state.overline.thickness = parseInt(e.target.value) || 2;
    updatePreview();
  });

  document.getElementById('textRotate').addEventListener('input', (e) => {
    state.transform.rotate = parseInt(e.target.value) || 0;
    updatePreview();
  });

  document.getElementById('marqueeFade').addEventListener('change', (e) => {
    state.marqueeFade = e.target.checked;
    updatePreview();
  });

  document.querySelectorAll('[data-mode]').forEach(btn =>
    btn.addEventListener('click', () => setTextMode(btn.dataset.mode)));

  document.querySelectorAll('[data-align]').forEach(btn =>
    btn.addEventListener('click', () => setTextAlign(btn.dataset.align)));

  document.querySelectorAll('[data-color]').forEach(btn =>
    btn.addEventListener('click', () => setColorMode(btn.dataset.color)));

  document.querySelectorAll('.direction-btn').forEach(btn =>
    btn.addEventListener('click', () => setGradientDir(btn.dataset.dir)));

  document.querySelectorAll('[data-effect]').forEach(btn =>
    btn.addEventListener('click', () => toggleEffect(btn.dataset.effect)));

  document.querySelectorAll('[data-transform]').forEach(btn =>
    btn.addEventListener('click', () => toggleTransform(btn.dataset.transform)));

  document.querySelectorAll('.underline-style').forEach(btn =>
    btn.addEventListener('click', () => setUnderlineStyle(btn.dataset.ulstyle)));

  document.querySelectorAll('.overline-style').forEach(btn =>
    btn.addEventListener('click', () => setOverlineStyle(btn.dataset.olstyle)));

  document.querySelectorAll('.animation-option').forEach(btn =>
    btn.addEventListener('click', () => setAnimation(btn.dataset.anim)));

  document.querySelectorAll('[data-mdir]').forEach(btn =>
    btn.addEventListener('click', () => setMarqueeDir(btn.dataset.mdir)));

  document.getElementById('copyBtn').addEventListener('click', copyFromOutput);
}

function measureLineWidth(text) {
  const fontWeight = state.effects.bold ? Math.max(state.fontWeight, 700) : state.fontWeight;
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;' +
    'font-family:' + state.font.family + ';' +
    'font-size:' + state.fontSize + 'px;' +
    'font-weight:' + fontWeight + ';' +
    (state.effects.italic ? 'font-style:italic;' : '') +
    'letter-spacing:' + (state.letterSpacing || 0) + 'px';
  probe.textContent = text;
  document.body.appendChild(probe);
  const w = Math.ceil(probe.getBoundingClientRect().width);
  document.body.removeChild(probe);
  return w;
}

// this is the main function that creates the rentry-compatible svg code
// it's pretty long because there's a lot of different options to handle
// the output uses data uri format which rentry supports

function generateCode() {
  const lines = state.textMode === 'multi' ? state.text.split('\n') : [state.text];
  const lineHeight = state.fontSize * 1.3;  // standard line height ratio

  const effectPadding = Math.max(
    state.glowEnabled ? state.glowSize * 2 : 0,
    state.shadowEnabled ? Math.abs(state.shadowY) + state.shadowBlur : 0,
    state.outlineEnabled ? state.outlineWidth * 2 : 0,
    state.animation === 'bounce' || state.animation === 'float' || state.animation === 'wave' ? 15 : 0,
    state.animation === 'zoom' ? state.fontSize * 0.15 : 0
  );
  const totalHeight = Math.ceil(lines.length * lineHeight + effectPadding * 2 + state.fontSize * 0.3);

  let styles = [];
  let defs = '';

  styles.push(`font-family:${state.font.family}`);
  styles.push(`font-size:${state.fontSize}px`);

  const effectiveWeight = state.effects.bold ? Math.max(state.fontWeight, 700) : state.fontWeight;
  styles.push(`font-weight:${effectiveWeight}`);

  if (state.colorMode === 'gradient') {
    const dirs = {
      'right': { x1: '0%25', y1: '0%25', x2: '100%25', y2: '0%25' },
      'left': { x1: '100%25', y1: '0%25', x2: '0%25', y2: '0%25' },
      'down': { x1: '0%25', y1: '0%25', x2: '0%25', y2: '100%25' },
      'up': { x1: '0%25', y1: '100%25', x2: '0%25', y2: '0%25' }
    };
    const d = dirs[state.gradientDir];
    const gradOpacity = state.gradientOpacity < 1 ? ` stop-opacity='${state.gradientOpacity}'` : '';
    defs = `<defs><linearGradient id='g' x1='${d.x1}' y1='${d.y1}' x2='${d.x2}' y2='${d.y2}'><stop offset='0%25' stop-color='${state.gradientStart.replace('#', '%23')}'${gradOpacity}/><stop offset='100%25' stop-color='${state.gradientEnd.replace('#', '%23')}'${gradOpacity}/></linearGradient></defs>`;
    styles.push('fill:url%28%23g%29');
  } else {
    styles.push(`fill:${state.solidColor.replace('#', '%23')}`);
    if (state.solidOpacity < 1) {
      styles.push(`fill-opacity:${state.solidOpacity}`);
    }
  }

  if (state.outlineEnabled) {
    styles.push(`stroke:${state.outlineColor.replace('#', '%23')}`);
    styles.push(`stroke-width:${state.outlineWidth}`);
    styles.push('paint-order:stroke fill');
  }

  if (state.effects.italic) styles.push('font-style:italic');
  if (state.letterSpacing > 0) styles.push(`letter-spacing:${state.letterSpacing}px`);

  let transforms = [];
  if (state.transform.rotate !== 0) {
    transforms.push(`rotate%28${state.transform.rotate}deg%29`);
  }
  if (state.transform.flipH) {
    transforms.push('scaleX%28-1%29');
  }
  if (state.transform.flipV) {
    transforms.push('scaleY%28-1%29');
  }

  let filters = [];
  let staticFilters = [];  // filters that stay constant (for glow-pulse animation)
  if (state.effects.blur) filters.push('blur%281px%29');
  if (state.shadowEnabled) {
    const shadowColorWithOpacity = hexToRgbaEncoded(state.shadowColor, state.shadowOpacity);
    const shadowFilter = `drop-shadow%28${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${shadowColorWithOpacity}%29`;
    filters.push(shadowFilter);
    staticFilters.push(shadowFilter);
  }
  if (state.glowEnabled) {
    const glowColorWithOpacity = hexToRgbaEncoded(state.glowColor, state.glowOpacity);
    filters.push(`drop-shadow%280 0 ${state.glowSize}px ${glowColorWithOpacity}%29`);
  }

  let animationProp = '';
  let animationKeyframes = '';
  const speed = state.animSpeed;

  switch (state.animation) {
    case 'bounce':
      animationProp = `animation:bounce ${speed}s ease-in-out infinite`;
      animationKeyframes = `@keyframes bounce{0%25,100%25{transform:translateY%280%29;}50%25{transform:translateY%28-5px%29;}}`;
      break;
    case 'pulse':
      animationProp = `animation:pulse ${speed}s ease-in-out infinite`;
      animationKeyframes = `@keyframes pulse{0%25,100%25{opacity:1;}50%25{opacity:0.5;}}`;
      break;
    case 'glow-pulse': {
      const glowCol = state.glowColor.replace('#', '%23');
      const baseFilters = staticFilters.length > 0 ? staticFilters.join(' ') + ' ' : '';
      animationProp = `animation:glowp ${speed}s ease-in-out infinite`;
      animationKeyframes = `@keyframes glowp{0%25,100%25{filter:${baseFilters}drop-shadow%280 0 2px ${glowCol}%29;}50%25{filter:${baseFilters}drop-shadow%280 0 10px ${glowCol}%29;}}`;
      filters = staticFilters.slice();
      break;
    }
    case 'color-shift':
      animationProp = `animation:colorshift ${speed}s linear infinite`;
      animationKeyframes = `@keyframes colorshift{0%25{fill:%23ff69b4;}33%25{fill:%2300ffff;}66%25{fill:%23ffd700;}100%25{fill:%23ff69b4;}}`;
      break;
    case 'float':
      animationProp = `animation:float ${speed}s ease-in-out infinite`;
      animationKeyframes = `@keyframes float{0%25,100%25{transform:translateY%280%29;}50%25{transform:translateY%28-8px%29;}}`;
      break;
    case 'wiggle':
    case 'zoom':
    case 'wave':
    case 'marquee':
    case 'scroll-up':
    case 'scroll-down':
      break;
  }

  if (filters.length > 0 && state.animation !== 'glow-pulse') {
    styles.push(`filter:${filters.join(' ')}`);
  }

  const isScrollAnim = state.animation === 'scroll-up' || state.animation === 'scroll-down';

  let groupTransforms = [];
  if (state.animation !== 'marquee' && !isScrollAnim) {
    groupTransforms = transforms.slice();
  }

  let groupAnimationCSS = '';
  let groupKeyframes = '';
  if (animationProp && ['bounce', 'float'].includes(state.animation)) {
    groupAnimationCSS = animationProp;
    groupKeyframes = animationKeyframes;
  } else if (animationProp && state.animation !== 'wave' && state.animation !== 'wiggle' &&
             state.animation !== 'zoom' && state.animation !== 'marquee' && !isScrollAnim) {
    styles.push(animationProp);
    groupKeyframes = animationKeyframes;
  }

  let textContent = '';
  const textY = Math.ceil(effectPadding + state.fontSize);

  let textAnchor = 'start';
  let textX = '0';
  if (state.textAlign === 'center') {
    textAnchor = 'middle';
    textX = '50%25';
  } else if (state.textAlign === 'right') {
    textAnchor = 'end';
    textX = '100%25';
  }

  const useMultiline = state.textMode === 'multi' && lines.length > 1 && state.animation !== 'marquee';
  const displayText = state.animation === 'marquee' ? state.text.replace(/\n/g, ' ') : state.text;

  let decorationElements = '';
  if ((state.underline.enabled || state.overline.enabled) && !isScrollAnim) {
    const isMarq = state.animation === 'marquee';
    const buildWavy = (w, y, amp, wl) => {
      const n = Math.ceil((w * 2) / wl) + 2;
      let p = `M 0 ${y} q ${wl/4} ${-amp} ${wl/2} 0`;
      for (let i = 1; i < n; i++) p += ` t ${wl/2} 0`;
      return p;
    };
    const buildDecor = (tw, y, decor) => {
      const c = decor.color.replace('#', '%23'), t = decor.thickness;
      if (decor.style === 'wavy')
        return `<path d='${buildWavy(tw, y, t*1.5, t*4)}' fill='none' stroke='${c}' stroke-width='${t}'/>`;
      const dash = decor.style === 'dashed' ? ` stroke-dasharray='${t*3} ${t*2}'` : '';
      return `<line x1='0' y1='${y}' x2='${tw}' y2='${y}' stroke='${c}' stroke-width='${t}'${dash}/>`;
    };
    if (useMultiline) {
      lines.forEach((line, i) => {
        const lineY = textY + i * Math.ceil(lineHeight);
        const tw = measureLineWidth(line);
        let el = '';
        if (state.underline.enabled) el += buildDecor(tw, lineY + state.fontSize * 0.12, state.underline);
        if (state.overline.enabled)  el += buildDecor(tw, lineY - state.fontSize * 0.88, state.overline);
        const xAlign = state.textAlign === 'center' ? `calc%2850%25 - ${tw/2}px%29` :
                       state.textAlign === 'right'  ? `calc%28100%25 - ${tw}px%29` : '0';
        decorationElements += `<g style='transform:translateX%28${xAlign}%29'>${el}</g>`;
      });
    } else {
      const tw = measureLineWidth(displayText);
      let el = '';
      if (state.underline.enabled) el += buildDecor(tw, textY + state.fontSize * 0.12, state.underline);
      if (state.overline.enabled)  el += buildDecor(tw, textY - state.fontSize * 0.88, state.overline);
      if (isMarq) {
        decorationElements = el;
      } else {
        let wrapStyle = '';
        if (state.textAlign === 'center') wrapStyle = ` style='transform:translateX%28calc%2850%25 - ${tw/2}px%29%29'`;
        else if (state.textAlign === 'right') wrapStyle = ` style='transform:translateX%28calc%28100%25 - ${tw}px%29%29'`;
        decorationElements = `<g${wrapStyle}>${el}</g>`;
      }
    }
  }

  let extraStyles = '';

  if (state.animation === 'wave') {
    const delay = 0.1;
    const charWidth = state.fontSize * 0.6;
    const step = charWidth + state.letterSpacing;
    const amp = Math.max(3, Math.round(state.fontSize * 0.25));
    const splines = '0.45 0 0.55 1;0.45 0 0.55 1';

    const buildLetters = (line, lineY, startIdx) => {
      const lineWidth = line.length > 0 ? line.length * step - state.letterSpacing : 0;
      const startX = state.textAlign === 'center' ? -(lineWidth / 2) : state.textAlign === 'right' ? -lineWidth : 0;
      const vals = `${lineY};${lineY - amp};${lineY}`;
      let letters = '';
      for (let i = 0; i < line.length; i++) {
        const char = escapeText(line[i] === ' ' ? ' ' : line[i]);
        const lx = (startX + i * step).toFixed(1);
        const begin = ((startIdx + i) * delay).toFixed(1) + 's';
        letters += `<text x='${lx}' y='${lineY}'>${char}<animate attributeName='y' values='${vals}' dur='${speed}s' begin='${begin}' repeatCount='indefinite' calcMode='spline' keyTimes='0;0.5;1' keySplines='${splines}'/></text>`;
      }
      return letters;
    };

    if (useMultiline) {
      let inner = '', count = 0;
      lines.forEach((line, lineIdx) => {
        inner += buildLetters(line, textY + lineIdx * Math.ceil(lineHeight), count);
        count += line.length;
      });
      const anchorX = state.textAlign === 'center' ? '50%25' : '100%25';
      textContent = state.textAlign === 'left' ? inner : `<svg x='${anchorX}' overflow='visible'>${inner}</svg>`;
    } else {
      const inner = buildLetters(displayText, textY, 0);
      const anchorX = state.textAlign === 'center' ? '50%25' : '100%25';
      textContent = state.textAlign === 'left' ? inner : `<svg x='${anchorX}' overflow='visible'>${inner}</svg>`;
    }
  } else if (state.animation === 'marquee') {
    const text = displayText;
    const marqueeStyles = styles.join(';');
    const dir = state.marqueeDir || 'rtl';
    const isVert = dir === 'up' || dir === 'down';
    let keyframes, textEl;
    if (isVert) {
      const fromY = dir === 'up' ? '100%25' : '-100%25';
      const toY   = dir === 'up' ? '-100%25' : '100%25';
      keyframes = `@keyframes marq{from{transform:translateY%28${fromY}%29;}to{transform:translateY%28${toY}%29;}}`;
      textEl = `<text x='50%25' y='${textY}' text-anchor='middle'>${escapeText(text)}</text>`;
    } else if (dir === 'bounce') {
      keyframes = `@keyframes marq{0%25,100%25{transform:translateX%2880%25%29;}50%25{transform:translateX%28-80%25%29;}}`;
      textEl = `<text x='0' y='${textY}' text-anchor='start'>${escapeText(text)}</text>`;
    } else {
      const textWidth = measureLineWidth(text);
      const fromX = dir === 'ltr' ? `-${textWidth}px` : '100%25';
      const toX   = dir === 'ltr' ? '100%25' : `-${textWidth}px`;
      keyframes = `@keyframes marq{from{transform:translateX%28${fromX}%29;}to{transform:translateX%28${toX}%29;}}`;
      textEl = `<text x='0' y='${textY}' text-anchor='start'>${escapeText(text)}</text>`;
    }
    const animStyle = dir === 'bounce'
      ? `animation:marq ${speed * 3}s ease-in-out infinite;transform-box:view-box`
      : `animation:marq ${speed * 3}s linear infinite;transform-box:view-box`;
    const allStyles = `text{${marqueeStyles}}${keyframes}`;
    let scrollGroup;
    if (state.marqueeFade && !isVert) {
      defs += `<defs><mask id='fadeMask'><rect width='100%25' height='100%25' fill='white'/><rect width='15%25' height='100%25' fill='url%28%23fadeL%29'/><rect x='85%25' width='15%25' height='100%25' fill='url%28%23fadeR%29'/></mask><linearGradient id='fadeL' x1='0' x2='1'><stop offset='0' stop-color='black'/><stop offset='1' stop-color='white'/></linearGradient><linearGradient id='fadeR' x1='0' x2='1'><stop offset='0' stop-color='white'/><stop offset='1' stop-color='black'/></linearGradient></defs>`;
      scrollGroup = `<g style='mask:url%28%23fadeMask%29'><g style='${animStyle}'>${textEl}${decorationElements}</g></g>`;
    } else if (state.marqueeFade && isVert) {
      defs += `<defs><mask id='fadeMask'><rect width='100%25' height='100%25' fill='white'/><rect width='100%25' height='15%25' fill='url%28%23fadeT%29'/><rect y='85%25' width='100%25' height='15%25' fill='url%28%23fadeB%29'/></mask><linearGradient id='fadeT' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='black'/><stop offset='1' stop-color='white'/></linearGradient><linearGradient id='fadeB' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='white'/><stop offset='1' stop-color='black'/></linearGradient></defs>`;
      scrollGroup = `<g style='mask:url%28%23fadeMask%29'><g style='${animStyle}'>${textEl}${decorationElements}</g></g>`;
    } else {
      scrollGroup = `<g style='${animStyle}'>${textEl}${decorationElements}</g>`;
    }
    const svg = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'>${defs}<style>/*<![CDATA[*/${allStyles}/*]]>*/</style>${scrollGroup}</svg>){100%:${totalHeight}}`;
    return svg;
  } else if (isScrollAnim) {
    const marqueeStyles = styles.join(';');
    const up = state.animation === 'scroll-up';
    const fromY = up ? '100%25' : '-100%25';
    const toY   = up ? '-100%25' : '100%25';
    const keyframes = `@keyframes marqv{from{transform:translateY%28${fromY}%29;}to{transform:translateY%28${toY}%29;}}`;
    const animStyle = `animation:marqv ${speed * 3}s linear infinite;transform-box:view-box`;
    let textEl;
    if (useMultiline) {
      const tspans = lines.map((line, i) =>
        `<tspan x='${textX}' ${i === 0 ? `y='${textY}'` : `dy='${Math.ceil(lineHeight)}'`}>${escapeText(line)}</tspan>`
      ).join('');
      textEl = `<text text-anchor='${textAnchor}'>${tspans}</text>`;
    } else {
      textEl = `<text x='50%25' y='${textY}' text-anchor='middle'>${escapeText(displayText)}</text>`;
    }
    const allStyles = `text{${marqueeStyles}}${keyframes}`;
    const scrollGroup = `<g style='${animStyle}'>${textEl}${decorationElements}</g>`;
    const svg = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'>${defs}<style>/*<![CDATA[*/${allStyles}/*]]>*/</style>${scrollGroup}</svg>){100%:${totalHeight}}`;
    return svg;
  } else if (state.animation === 'wiggle' || state.animation === 'zoom') {
    const animName = state.animation;
    const keyframes = animName === 'wiggle'
      ? `@keyframes ${animName}{0%25,100%25{transform:rotate%280deg%29;}25%25{transform:rotate%283deg%29;}75%25{transform:rotate%28-3deg%29;}}`
      : `@keyframes ${animName}{0%25,100%25{transform:scale%281%29;}50%25{transform:scale%281.1%29;}}`;
    groupAnimationCSS = `animation:${animName} ${speed}s ease-in-out infinite;transform-origin:center;transform-box:fill-box`;
    extraStyles = keyframes;

    if (useMultiline) {
      const tspans = lines.map((line, i) => {
        return `<tspan x='${textX}' ${i === 0 ? `y='${textY}'` : `dy='${Math.ceil(lineHeight)}'`}>${escapeText(line)}</tspan>`;
      }).join('');
      textContent = `<text text-anchor='${textAnchor}'>${tspans}</text>`;
    } else {
      textContent = `<text x='${textX}' y='${textY}' text-anchor='${textAnchor}'>${escapeText(displayText)}</text>`;
    }
  } else if (useMultiline) {
    const tspans = lines.map((line, i) => {
      return `<tspan x='${textX}' ${i === 0 ? `y='${textY}'` : `dy='${Math.ceil(lineHeight)}'`}>${escapeText(line)}</tspan>`;
    }).join('');
    textContent = `<text text-anchor='${textAnchor}'>${tspans}</text>`;
  } else {
    textContent = `<text x='${textX}' y='${textY}' text-anchor='${textAnchor}'>${escapeText(displayText)}</text>`;
  }

  const styleStr = styles.join(';');

  // wrap content in group(s) for transforms and animations
  // use nested groups when both user transforms and transform-based animations exist
  // to prevent animation keyframes from overriding rotation/flip
  let content = `${textContent}${decorationElements}`;
  const transformAnimations = ['bounce', 'float', 'wiggle', 'zoom'];
  const hasTransformAnim = groupAnimationCSS && transformAnimations.includes(state.animation);
  const hasUserTransforms = groupTransforms.length > 0;

  if (hasUserTransforms && hasTransformAnim) {
    content = `<g style='${groupAnimationCSS}'>${content}</g>`;
    content = `<g style='transform:${groupTransforms.join(' ')};transform-origin:center center;transform-box:fill-box'>${content}</g>`;
  } else {
    const wrapperParts = [];
    if (hasUserTransforms) {
      wrapperParts.push(`transform:${groupTransforms.join(' ')}`);
      wrapperParts.push('transform-origin:center center');
      wrapperParts.push('transform-box:fill-box');
    }
    if (groupAnimationCSS) {
      wrapperParts.push(groupAnimationCSS);
    }
    if (wrapperParts.length > 0) {
      content = `<g style='${wrapperParts.join(';')}'>${content}</g>`;
    }
  }

  const allExtraStyles = extraStyles + groupKeyframes;
  const svg = `![](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'>${defs}<style>/*<![CDATA[*/text{${styleStr}}${allExtraStyles}/*]]>*/</style>${content}</svg>){100%:${totalHeight}}`;

  return svg;
}

// escape special characters for svg/xml
// also url-encode stuff that breaks data uris
function escapeText(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/#/g, '%23');
}

// basically the same as generateCode but outputs regular svg for the preview
// not url-encoded so it actually renders in the browser
// yeah there's some code duplication here but it works
function updatePreview() {
  const code = generateCode();
  document.getElementById('codeOutput').textContent = code;

  const lines = state.textMode === 'multi' ? state.text.split('\n') : [state.text];
  const lineHeight = state.fontSize * 1.3;

  const effectPadding = Math.max(
    state.glowEnabled ? state.glowSize * 2 : 0,
    state.shadowEnabled ? Math.abs(state.shadowY) + state.shadowBlur : 0,
    state.outlineEnabled ? state.outlineWidth * 2 : 0,
    state.animation === 'bounce' || state.animation === 'float' || state.animation === 'wave' ? 15 : 0,
    state.animation === 'zoom' ? state.fontSize * 0.15 : 0
  );
  const totalHeight = Math.ceil(lines.length * lineHeight + effectPadding * 2 + state.fontSize * 0.3);

  let styles = [];
  let defs = '';

  styles.push(`font-family:${state.font.family}`);
  styles.push(`font-size:${state.fontSize}px`);

  const effectiveWeight = state.effects.bold ? Math.max(state.fontWeight, 700) : state.fontWeight;
  styles.push(`font-weight:${effectiveWeight}`);

  if (state.colorMode === 'gradient') {
    const dirs = {
      'right': { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
      'left': { x1: '100%', y1: '0%', x2: '0%', y2: '0%' },
      'down': { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
      'up': { x1: '0%', y1: '100%', x2: '0%', y2: '0%' }
    };
    const d = dirs[state.gradientDir];
    const gradOpacity = state.gradientOpacity < 1 ? ` stop-opacity="${state.gradientOpacity}"` : '';
    defs = `<defs><linearGradient id="gp" x1="${d.x1}" y1="${d.y1}" x2="${d.x2}" y2="${d.y2}"><stop offset="0%" stop-color="${state.gradientStart}"${gradOpacity}/><stop offset="100%" stop-color="${state.gradientEnd}"${gradOpacity}/></linearGradient></defs>`;
    styles.push('fill:url(#gp)');
  } else {
    styles.push(`fill:${state.solidColor}`);
    if (state.solidOpacity < 1) {
      styles.push(`fill-opacity:${state.solidOpacity}`);
    }
  }

  if (state.outlineEnabled) {
    styles.push(`stroke:${state.outlineColor}`);
    styles.push(`stroke-width:${state.outlineWidth}`);
    styles.push('paint-order:stroke fill');
  }

  if (state.effects.italic) styles.push('font-style:italic');
  if (state.letterSpacing > 0) styles.push(`letter-spacing:${state.letterSpacing}px`);

  let transforms = [];
  if (state.transform.rotate !== 0) {
    transforms.push(`rotate(${state.transform.rotate}deg)`);
  }
  if (state.transform.flipH) {
    transforms.push('scaleX(-1)');
  }
  if (state.transform.flipV) {
    transforms.push('scaleY(-1)');
  }

  let filters = [];
  let staticFilters = [];
  if (state.effects.blur) filters.push('blur(1px)');
  if (state.shadowEnabled) {
    const shadowColorWithOpacity = hexToRgba(state.shadowColor, state.shadowOpacity);
    const shadowFilter = `drop-shadow(${state.shadowX}px ${state.shadowY}px ${state.shadowBlur}px ${shadowColorWithOpacity})`;
    filters.push(shadowFilter);
    staticFilters.push(shadowFilter);
  }
  if (state.glowEnabled) {
    const glowColorWithOpacity = hexToRgba(state.glowColor, state.glowOpacity);
    filters.push(`drop-shadow(0 0 ${state.glowSize}px ${glowColorWithOpacity})`);
  }

  let animationProp = '';
  let animationKeyframes = '';
  const speed = state.animSpeed;

  switch (state.animation) {
    case 'bounce':
      animationProp = `animation:bounce ${speed}s ease-in-out infinite`;
      animationKeyframes = `@keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}`;
      break;
    case 'pulse':
      animationProp = `animation:pulse ${speed}s ease-in-out infinite`;
      animationKeyframes = `@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}`;
      break;
    case 'glow-pulse': {
      const baseFilters = staticFilters.length > 0 ? staticFilters.join(' ') + ' ' : '';
      animationProp = `animation:glowp ${speed}s ease-in-out infinite`;
      animationKeyframes = `@keyframes glowp{0%,100%{filter:${baseFilters}drop-shadow(0 0 2px ${state.glowColor});}50%{filter:${baseFilters}drop-shadow(0 0 10px ${state.glowColor});}}`;
      filters = staticFilters.slice();
      break;
    }
    case 'color-shift':
      animationProp = `animation:colorshift ${speed}s linear infinite`;
      animationKeyframes = `@keyframes colorshift{0%{fill:#ff69b4;}33%{fill:#00ffff;}66%{fill:#ffd700;}100%{fill:#ff69b4;}}`;
      break;
    case 'float':
      animationProp = `animation:float ${speed}s ease-in-out infinite`;
      animationKeyframes = `@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}`;
      break;
    case 'wiggle':
    case 'zoom':
    case 'wave':
    case 'marquee':
    case 'scroll-up':
    case 'scroll-down':
      break;
  }

  if (filters.length > 0 && state.animation !== 'glow-pulse') {
    styles.push(`filter:${filters.join(' ')}`);
  }

  const isScrollAnim = state.animation === 'scroll-up' || state.animation === 'scroll-down';

  let groupTransforms = [];
  if (state.animation !== 'marquee' && !isScrollAnim) {
    groupTransforms = transforms.slice();
  }

  let groupAnimationCSS = '';
  let groupKeyframes = '';
  if (animationProp && ['bounce', 'float'].includes(state.animation)) {
    groupAnimationCSS = animationProp;
    groupKeyframes = animationKeyframes;
  } else if (animationProp && state.animation !== 'wave' && state.animation !== 'wiggle' &&
             state.animation !== 'zoom' && state.animation !== 'marquee' && !isScrollAnim) {
    styles.push(animationProp);
    groupKeyframes = animationKeyframes;
  }

  let textAnchor = 'start';
  let textX = '0';
  if (state.textAlign === 'center') {
    textAnchor = 'middle';
    textX = '50%';
  } else if (state.textAlign === 'right') {
    textAnchor = 'end';
    textX = '100%';
  }

  const textY = Math.ceil(effectPadding + state.fontSize);
  let textContent = '';
  let extraStyles = '';
  let allExtraStyles = '';

  const useMultiline = state.textMode === 'multi' && lines.length > 1 && state.animation !== 'marquee';
  const displayText = state.animation === 'marquee' ? state.text.replace(/\n/g, ' ') : state.text;

  let decorationElements = '';
  if ((state.underline.enabled || state.overline.enabled) && !isScrollAnim) {
    const isMarq = state.animation === 'marquee';
    const buildWavy = (w, y, amp, wl) => {
      const n = Math.ceil((w * 2) / wl) + 2;
      let p = `M 0 ${y} q ${wl/4} ${-amp} ${wl/2} 0`;
      for (let i = 1; i < n; i++) p += ` t ${wl/2} 0`;
      return p;
    };
    const buildDecor = (tw, y, decor) => {
      const c = decor.color, t = decor.thickness;
      if (decor.style === 'wavy')
        return `<path d="${buildWavy(tw, y, t*1.5, t*4)}" fill="none" stroke="${c}" stroke-width="${t}"/>`;
      const dash = decor.style === 'dashed' ? ` stroke-dasharray="${t*3} ${t*2}"` : '';
      return `<line x1="0" y1="${y}" x2="${tw}" y2="${y}" stroke="${c}" stroke-width="${t}"${dash}/>`;
    };
    if (useMultiline) {
      lines.forEach((line, i) => {
        const lineY = textY + i * Math.ceil(lineHeight);
        const tw = measureLineWidth(line);
        let el = '';
        if (state.underline.enabled) el += buildDecor(tw, lineY + state.fontSize * 0.12, state.underline);
        if (state.overline.enabled)  el += buildDecor(tw, lineY - state.fontSize * 0.88, state.overline);
        const alignStyle = state.textAlign === 'center' ? `calc(50% - ${tw/2}px)` :
                           state.textAlign === 'right'  ? `calc(100% - ${tw}px)` : '0';
        decorationElements += `<g style="transform:translateX(${alignStyle})">${el}</g>`;
      });
    } else {
      const tw = measureLineWidth(displayText);
      let el = '';
      if (state.underline.enabled) el += buildDecor(tw, textY + state.fontSize * 0.12, state.underline);
      if (state.overline.enabled)  el += buildDecor(tw, textY - state.fontSize * 0.88, state.overline);
      if (isMarq) {
        decorationElements = el;
      } else {
        let wrapStyle = '';
        if (state.textAlign === 'center') wrapStyle = ` style="transform:translateX(calc(50% - ${tw/2}px))"`;
        else if (state.textAlign === 'right') wrapStyle = ` style="transform:translateX(calc(100% - ${tw}px))"`;
        decorationElements = `<g${wrapStyle}>${el}</g>`;
      }
    }
  }

  if (state.animation === 'wave') {
    const delay = 0.1;
    const charWidth = state.fontSize * 0.6;
    const step = charWidth + state.letterSpacing;
    const amp = Math.max(3, Math.round(state.fontSize * 0.25));
    const splines = '0.45 0 0.55 1;0.45 0 0.55 1';

    const buildLetters = (line, lineY, startIdx) => {
      const lineWidth = line.length > 0 ? line.length * step - state.letterSpacing : 0;
      const startX = state.textAlign === 'center' ? -(lineWidth / 2) : state.textAlign === 'right' ? -lineWidth : 0;
      const vals = `${lineY};${lineY - amp};${lineY}`;
      let letters = '';
      for (let i = 0; i < line.length; i++) {
        const char = escapeHTML(line[i] === ' ' ? ' ' : line[i]);
        const lx = (startX + i * step).toFixed(1);
        const begin = ((startIdx + i) * delay).toFixed(1) + 's';
        letters += `<text x="${lx}" y="${lineY}">${char}<animate attributeName="y" values="${vals}" dur="${speed}s" begin="${begin}" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="${splines}"/></text>`;
      }
      return letters;
    };

    if (useMultiline) {
      let inner = '', count = 0;
      lines.forEach((line, lineIdx) => {
        inner += buildLetters(line, textY + lineIdx * Math.ceil(lineHeight), count);
        count += line.length;
      });
      const anchorX = state.textAlign === 'center' ? '50%' : '100%';
      textContent = state.textAlign === 'left' ? inner : `<svg x="${anchorX}" overflow="visible">${inner}</svg>`;
    } else {
      const inner = buildLetters(displayText, textY, 0);
      const anchorX = state.textAlign === 'center' ? '50%' : '100%';
      textContent = state.textAlign === 'left' ? inner : `<svg x="${anchorX}" overflow="visible">${inner}</svg>`;
    }
  } else if (state.animation === 'marquee') {
    const text = displayText;
    const dir = state.marqueeDir || 'rtl';
    const isVert = dir === 'up' || dir === 'down';
    let textEl;
    if (isVert) {
      const fromY = dir === 'up' ? '100%' : '-100%';
      const toY   = dir === 'up' ? '-100%' : '100%';
      extraStyles = `@keyframes marq{from{transform:translateY(${fromY});}to{transform:translateY(${toY});}}`;
      textEl = `<text x="50%" y="${textY}" text-anchor="middle">${escapeHTML(text)}</text>`;
    } else if (dir === 'bounce') {
      extraStyles = `@keyframes marq{0%,100%{transform:translateX(80%);}50%{transform:translateX(-80%);}}`;
      textEl = `<text x="0" y="${textY}" text-anchor="start">${escapeHTML(text)}</text>`;
    } else {
      const textWidth = measureLineWidth(text);
      const fromX = dir === 'ltr' ? `-${textWidth}px` : '100%';
      const toX   = dir === 'ltr' ? '100%' : `-${textWidth}px`;
      extraStyles = `@keyframes marq{from{transform:translateX(${fromX});}to{transform:translateX(${toX});}}`;
      textEl = `<text x="0" y="${textY}" text-anchor="start">${escapeHTML(text)}</text>`;
    }
    const animStyle = dir === 'bounce'
      ? `animation:marq ${speed * 3}s ease-in-out infinite;transform-box:view-box`
      : `animation:marq ${speed * 3}s linear infinite;transform-box:view-box`;
    if (state.marqueeFade && !isVert) {
      defs += `<defs><mask id="fadeMask"><rect width="100%" height="100%" fill="white"/><rect width="15%" height="100%" fill="url(#fadeL)"/><rect x="85%" width="15%" height="100%" fill="url(#fadeR)"/></mask><linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient><linearGradient id="fadeR" x1="0" x2="1"><stop offset="0" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient></defs>`;
      textContent = `<g style="mask:url(#fadeMask)"><g style="${animStyle}">${textEl}${decorationElements}</g></g>`;
      groupAnimationCSS = '';
      decorationElements = '';
    } else if (state.marqueeFade && isVert) {
      defs += `<defs><mask id="fadeMask"><rect width="100%" height="100%" fill="white"/><rect width="100%" height="15%" fill="url(#fadeT)"/><rect y="85%" width="100%" height="15%" fill="url(#fadeB)"/></mask><linearGradient id="fadeT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient><linearGradient id="fadeB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient></defs>`;
      textContent = `<g style="mask:url(#fadeMask)"><g style="${animStyle}">${textEl}${decorationElements}</g></g>`;
      groupAnimationCSS = '';
      decorationElements = '';
    } else {
      textContent = textEl;
      groupAnimationCSS = animStyle;
    }
  } else if (isScrollAnim) {
    const up = state.animation === 'scroll-up';
    const fromY = up ? '100%' : '-100%';
    const toY   = up ? '-100%' : '100%';
    extraStyles = `@keyframes marqv{from{transform:translateY(${fromY});}to{transform:translateY(${toY});}}`;
    const animStyle = `animation:marqv ${speed * 3}s linear infinite;transform-box:view-box`;
    if (useMultiline) {
      const tspans = lines.map((line, i) =>
        `<tspan x="${textX}" ${i === 0 ? `y="${textY}"` : `dy="${Math.ceil(lineHeight)}"`}>${escapeHTML(line)}</tspan>`
      ).join('');
      textContent = `<text text-anchor="${textAnchor}">${tspans}</text>`;
    } else {
      textContent = `<text x="50%" y="${textY}" text-anchor="middle">${escapeHTML(displayText)}</text>`;
    }
    groupAnimationCSS = animStyle;
  } else if (state.animation === 'wiggle' || state.animation === 'zoom') {
    const animName = state.animation;
    const keyframes = animName === 'wiggle'
      ? `@keyframes ${animName}{0%,100%{transform:rotate(0deg);}25%{transform:rotate(3deg);}75%{transform:rotate(-3deg);}}`
      : `@keyframes ${animName}{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}`;
    extraStyles = keyframes;
    groupAnimationCSS = `animation:${animName} ${speed}s ease-in-out infinite;transform-origin:center;transform-box:fill-box;`;

    if (useMultiline) {
      const tspans = lines.map((line, i) => {
        return `<tspan x="${textX}" ${i === 0 ? `y="${textY}"` : `dy="${Math.ceil(lineHeight)}"`}>${escapeHTML(line)}</tspan>`;
      }).join('');
      textContent = `<text text-anchor="${textAnchor}">${tspans}</text>`;
    } else {
      textContent = `<text x="${textX}" y="${textY}" text-anchor="${textAnchor}">${escapeHTML(displayText)}</text>`;
    }
  } else if (useMultiline) {
    const tspans = lines.map((line, i) => {
      return `<tspan x="${textX}" ${i === 0 ? `y="${textY}"` : `dy="${Math.ceil(lineHeight)}"`}>${escapeHTML(line)}</tspan>`;
    }).join('');
    textContent = `<text text-anchor="${textAnchor}">${tspans}</text>`;
  } else {
    textContent = `<text x="${textX}" y="${textY}" text-anchor="${textAnchor}">${escapeHTML(displayText)}</text>`;
  }

  let content = `${textContent}${decorationElements}`;
  const transformAnimations = ['bounce', 'float', 'wiggle', 'zoom'];
  const hasTransformAnim = groupAnimationCSS && transformAnimations.includes(state.animation);
  const hasUserTransforms = groupTransforms.length > 0;

  if (hasUserTransforms && hasTransformAnim) {
    content = `<g style="${groupAnimationCSS}">${content}</g>`;
    content = `<g style="transform:${groupTransforms.join(' ')};transform-origin:center center;transform-box:fill-box">${content}</g>`;
  } else {
    const wrapperParts = [];
    if (hasUserTransforms) {
      wrapperParts.push(`transform:${groupTransforms.join(' ')}`);
      wrapperParts.push('transform-origin:center center');
      wrapperParts.push('transform-box:fill-box');
    }
    if (groupAnimationCSS) {
      wrapperParts.push(groupAnimationCSS);
    }
    if (wrapperParts.length > 0) {
      content = `<g style="${wrapperParts.join(';')}">${content}</g>`;
    }
  }

  allExtraStyles = extraStyles + groupKeyframes;
  const previewSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${Math.max(totalHeight, 80)}">${defs}<style>text{${styles.join(';')}}${allExtraStyles}</style>${content}</svg>`;

  document.getElementById('previewContent').innerHTML = previewSVG;
}

function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

fetch('fonts.json')
  .then(r => r.json())
  .then(data => {
    fonts = data;
    state.font = fonts[0];
    initFontGrid();
    initEventListeners();
    updatePreview();
  });
