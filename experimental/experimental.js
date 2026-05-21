import { hexToRgba } from '../shared/color.js';
import { escXML, buildWavyPath, buildLineDecor } from '../shared/svg.js';
import '../shared/components.js';
import { copyFromOutput } from '../shared/persistence.js';

var _fontCache  = {};
var _customFont = null;

var state = {
  fontSize: 42,
  fontWeight: 400,
  colorMode: 'solid',
  solidColor: '#ffffff',
  solidOpacity: 1,
  gradientStart: '#ff69b4',
  gradientEnd: '#00ffff',
  gradientDir: 'right',
  gradientOpacity: 1,
  effects: { bold: false, italic: false, blur: false },
  letterSpacing: 0,
  underline: { enabled: false, style: 'solid', color: '#ffffff', thickness: 2 },
  overline:  { enabled: false, style: 'solid', color: '#ffffff', thickness: 2 },
  outlineEnabled: false,
  outlineColor: '#ffffff',
  outlineWidth: 1,
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
  marqueeType: 'rtl',
  marqueeFade: false,
  animSpeed: 8
};

function el(id)  { return document.getElementById(id); }
function on(id, ev, fn) { el(id).addEventListener(ev, fn); }

function activeFamily() {
  return _customFont ? _customFont.family : el('fontPicker').value;
}

function setStatus(msg) { el('embedStatus').textContent = msg; }

function setColorMode(mode) {
  state.colorMode = mode;
  document.querySelectorAll('[data-color]').forEach(function(b) { b.classList.toggle('active', b.dataset.color === mode); });
  el('solidColorSection').style.display    = mode === 'solid' ? '' : 'none';
  el('gradientColorSection').style.display = mode === 'gradient' ? '' : 'none';
  updateLivePreview();
}

function setGradientDir(dir) {
  state.gradientDir = dir;
  document.querySelectorAll('.direction-btn').forEach(function(b) { b.classList.toggle('selected', b.dataset.dir === dir); });
  updateLivePreview();
}

function toggleEffect(effect) {
  state.effects[effect] = !state.effects[effect];
  document.querySelector('[data-effect="' + effect + '"]').classList.toggle('selected');
  updateLivePreview();
}

function toggleDecoration(type) {
  var key = type === 'underline' ? 'underline' : 'overline';
  state[key].enabled = el(key + 'Enabled').checked;
  el(key + 'Settings').classList.toggle('visible', state[key].enabled);
  updateLivePreview();
}

function setUnderlineStyle(style) {
  state.underline.style = style;
  document.querySelectorAll('.underline-style').forEach(function(b) { b.classList.toggle('selected', b.dataset.ulstyle === style); });
  updateLivePreview();
}

function setOverlineStyle(style) {
  state.overline.style = style;
  document.querySelectorAll('.overline-style').forEach(function(b) { b.classList.toggle('selected', b.dataset.olstyle === style); });
  updateLivePreview();
}

function toggleOutline() {
  state.outlineEnabled = el('outlineEnabled').checked;
  el('outlineSettings').classList.toggle('visible', state.outlineEnabled);
  updateLivePreview();
}

function toggleGlow() {
  state.glowEnabled = el('glowEnabled').checked;
  el('glowSettings').classList.toggle('visible', state.glowEnabled);
  updateLivePreview();
}

function toggleShadow() {
  state.shadowEnabled = el('shadowEnabled').checked;
  el('shadowSettings').classList.toggle('visible', state.shadowEnabled);
  updateLivePreview();
}

function setMarqueeType(type) {
  state.marqueeType = type;
  document.querySelectorAll('[data-mtype]').forEach(function(b) { b.classList.toggle('selected', b.dataset.mtype === type); });
  updateLivePreview();
}

function updateLivePreview() {
  var span  = el('marqSpan');
  var track = el('marqTrack');
  var box   = el('marqBox');

  span.textContent     = el('textInput').value || 'Hello World';
  span.style.fontFamily    = '"' + activeFamily() + '", serif';
  span.style.fontSize      = state.fontSize + 'px';
  span.style.fontWeight    = state.effects.bold ? Math.max(state.fontWeight, 700) : state.fontWeight;
  span.style.fontStyle     = state.effects.italic ? 'italic' : '';
  span.style.letterSpacing = state.letterSpacing > 0 ? state.letterSpacing + 'px' : '';

  if (state.colorMode === 'gradient') {
    var dirs = { right:'to right', left:'to left', down:'to bottom', up:'to top' };
    span.style.background          = 'linear-gradient(' + dirs[state.gradientDir] + ',' + state.gradientStart + ',' + state.gradientEnd + ')';
    span.style.webkitBackgroundClip = 'text';
    span.style.backgroundClip      = 'text';
    span.style.webkitTextFillColor  = 'transparent';
    span.style.color   = '';
    span.style.opacity = state.gradientOpacity;
  } else {
    span.style.background          = '';
    span.style.webkitBackgroundClip = '';
    span.style.backgroundClip      = '';
    span.style.webkitTextFillColor  = '';
    span.style.color   = state.solidColor;
    span.style.opacity = state.solidOpacity;
  }

  span.style.webkitTextStroke = state.outlineEnabled ? state.outlineWidth + 'px ' + state.outlineColor : '';

  var filters = [];
  if (state.effects.blur)  filters.push('blur(1px)');
  if (state.shadowEnabled) filters.push('drop-shadow(' + state.shadowX + 'px ' + state.shadowY + 'px ' + state.shadowBlur + 'px ' + hexToRgba(state.shadowColor, state.shadowOpacity) + ')');
  if (state.glowEnabled)   filters.push('drop-shadow(0 0 ' + state.glowSize + 'px ' + hexToRgba(state.glowColor, state.glowOpacity) + ')');
  span.style.filter = filters.join(' ');

  var decorLines = [];
  if (state.underline.enabled) decorLines.push('underline');
  if (state.overline.enabled)  decorLines.push('overline');
  if (decorLines.length) {
    var decorRef = state.underline.enabled ? state.underline : state.overline;
    span.style.textDecoration      = '';
    span.style.textDecorationLine  = decorLines.join(' ');
    span.style.textDecorationColor = decorRef.color;
    span.style.textDecorationStyle = decorRef.style;
  } else {
    span.style.textDecorationLine  = '';
    span.style.textDecorationColor = '';
    span.style.textDecorationStyle = '';
  }

  var fadeMask = state.marqueeFade ? 'linear-gradient(to right, transparent, black 12%, black 88%, transparent)' : '';
  box.style.maskImage       = fadeMask;
  box.style.webkitMaskImage = fadeMask;

  track.style.animation = (state.marqueeType === 'ltr' ? 'scroll-ltr' : 'scroll-rtl') + ' ' + state.animSpeed + 's linear infinite';
}

function loadFontFromUrl() {
  var raw = el('fontUrlInput').value.trim();
  if (!raw) return;
  var m = raw.match(/\/specimen\/([^?&#]+)/);
  if (!m) { setStatus('Not a valid Google Fonts specimen URL.'); return; }
  var slug   = m[1].replace(/ /g, '+');
  var family = decodeURIComponent(slug.replace(/\+/g, ' '));
  _customFont = { family: family, slug: slug };
  var prev = el('_dyn_font_link');
  if (prev) prev.remove();
  var link  = document.createElement('link');
  link.id   = '_dyn_font_link';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=' + slug + '&display=swap';
  document.head.appendChild(link);
  updateLivePreview();
}

function buildSubset(text) {
  var seen = {}, chars = '';
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    if (!seen[c]) { seen[c] = true; chars += c; }
  }
  return chars || ' ';
}

function bufToB64(buf) {
  var bytes = new Uint8Array(buf), out = '', C = 8192;
  for (var i = 0; i < bytes.length; i += C)
    out += String.fromCharCode.apply(null, bytes.subarray(i, i + C));
  return btoa(out);
}

function fetchB64(url) {
  return fetch(url).then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.arrayBuffer();
  }).then(bufToB64);
}

function extractUrls(css) {
  var urls = [];
  css.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g, function(_, u) { urls.push(u); });
  return urls;
}

function fetchLatinFromCss(famSlug) {
  return fetch('https://fonts.googleapis.com/css2?family=' + famSlug + '&display=swap')
    .then(function(r) { return r.text(); })
    .then(function(css) {
      var urls = extractUrls(css);
      if (!urls.length) throw new Error('No WOFF2 found for ' + famSlug);
      setStatus('Fetching Latin subset…');
      return fetchB64(urls[urls.length - 1]).then(function(b) { return [b]; });
    });
}

function embedFont() {
  var fam      = activeFamily();
  var fallback = _customFont ? null : el('fontPicker').selectedOptions[0].dataset.url;
  var btn      = el('embedBtn');
  var subset   = buildSubset(el('textInput').value || 'Hello World');
  var cacheKey = fam + '\x00' + subset;

  if (_fontCache[cacheKey]) {
    buildSVG(fam, _fontCache[cacheKey]);
    el('copyBtn').disabled = false;
    return;
  }

  btn.disabled = true;
  setStatus('Fetching "' + fam + '" from Google Fonts…');

  var famSlug = fam.replace(/ /g, '+');
  fetch('https://fonts.googleapis.com/css2?family=' + famSlug + '&text=' + encodeURIComponent(subset) + '&display=swap')
    .then(function(r) { return r.text(); })
    .then(function(css) {
      var urls = extractUrls(css);
      if (!urls.length) throw new Error('empty');
      setStatus('Downloading ' + urls.length + ' glyph subset(s)…');
      return Promise.all(urls.map(fetchB64));
    })
    .catch(function() {
      return fallback
        ? (setStatus('Fetching Latin subset…'), fetchB64(fallback).then(function(b) { return [b]; }))
        : fetchLatinFromCss(famSlug);
    })
    .then(function(b64arr) {
      _fontCache[cacheKey] = b64arr;
      buildSVG(fam, b64arr);
      btn.disabled = false;
      el('copyBtn').disabled = false;
      el('gifBtn').disabled = false;
      var kb = Math.round(b64arr.reduce(function(s, b) { return s + b.length * 0.75; }, 0) / 1024);
      setStatus('Done! ~' + kb + ' KB across ' + b64arr.length + ' subset(s).');
    })
    .catch(function(err) {
      btn.disabled = false;
      setStatus('Error: ' + (err && err.message ? err.message : String(err)));
    });
}

function measureTextWidth(text, fontFamily, fontSize, fontWeight, letterSpacing) {
  var probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;' +
    'font-family:"' + fontFamily + '",serif;' +
    'font-size:' + fontSize + 'px;' +
    'font-weight:' + fontWeight + ';' +
    'letter-spacing:' + (letterSpacing || 0) + 'px';
  probe.textContent = text;
  document.body.appendChild(probe);
  var w = Math.ceil(probe.getBoundingClientRect().width);
  document.body.removeChild(probe);
  return w;
}

function buildSVG(fontFamily, b64arr) {
  var text = (el('textInput').value || 'Hello World').replace(/\n/g, ' ');
  var effectPadding = Math.max(
    state.glowEnabled   ? state.glowSize * 2 : 0,
    state.shadowEnabled ? Math.abs(state.shadowY) + state.shadowBlur : 0
  );
  var W     = 700;
  var H     = Math.ceil(state.fontSize + effectPadding * 2 + state.fontSize * 0.3);
  var textY = Math.ceil(effectPadding + state.fontSize);

  var fontFaces = b64arr.map(function(b64) {
    return '@font-face{font-family:"' + fontFamily + '";src:url("data:font/woff2;base64,' + b64 + '") format("woff2");}';
  }).join('');

  var textStyles = [
    'font-family:"' + fontFamily + '",serif',
    'font-size:' + state.fontSize + 'px',
    'font-weight:' + (state.effects.bold ? Math.max(state.fontWeight, 700) : state.fontWeight)
  ];
  if (state.effects.italic)    textStyles.push('font-style:italic');
  if (state.letterSpacing > 0) textStyles.push('letter-spacing:' + state.letterSpacing + 'px');

  var defsContent = '';
  if (state.colorMode === 'gradient') {
    var gdirs = {
      right: 'x1="0%" y1="0%" x2="100%" y2="0%"', left: 'x1="100%" y1="0%" x2="0%" y2="0%"',
      down:  'x1="0%" y1="0%" x2="0%" y2="100%"', up:   'x1="0%" y1="100%" x2="0%" y2="0%"'
    };
    var gop = state.gradientOpacity < 1 ? ' stop-opacity="' + state.gradientOpacity + '"' : '';
    defsContent += '<linearGradient id="g" ' + gdirs[state.gradientDir] + '>' +
      '<stop offset="0%" stop-color="' + state.gradientStart + '"' + gop + '/>' +
      '<stop offset="100%" stop-color="' + state.gradientEnd + '"' + gop + '/></linearGradient>';
    textStyles.push('fill:url(#g)');
  } else {
    textStyles.push('fill:' + state.solidColor);
    if (state.solidOpacity < 1) textStyles.push('fill-opacity:' + state.solidOpacity);
  }

  if (state.outlineEnabled) {
    textStyles.push('stroke:' + state.outlineColor, 'stroke-width:' + state.outlineWidth, 'paint-order:stroke fill');
  }

  var filters = [];
  if (state.effects.blur)  filters.push('blur(1px)');
  if (state.shadowEnabled) filters.push('drop-shadow(' + state.shadowX + 'px ' + state.shadowY + 'px ' + state.shadowBlur + 'px ' + hexToRgba(state.shadowColor, state.shadowOpacity) + ')');
  if (state.glowEnabled)   filters.push('drop-shadow(0 0 ' + state.glowSize + 'px ' + hexToRgba(state.glowColor, state.glowOpacity) + ')');
  if (filters.length) textStyles.push('filter:' + filters.join(' '));

  var dur   = state.animSpeed + 's';
  var fromX = state.marqueeType === 'ltr' ? '-100%' : '100%';
  var toX   = state.marqueeType === 'ltr' ? '100%'  : '-100%';
  var keyframes = '@keyframes marq{from{transform:translateX(' + fromX + ');}to{transform:translateX(' + toX + ');}}';
  var animStyle = 'animation:marq ' + dur + ' linear infinite;transform-box:view-box';
  var textEl    = '<text x="0" y="' + textY + '">' + escXML(text) + '</text>';

  if (state.marqueeFade) {
    defsContent +=
      '<linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient>' +
      '<linearGradient id="fadeR" x1="0" x2="1"><stop offset="0" stop-color="white"/><stop offset="1" stop-color="black"/></linearGradient>' +
      '<mask id="fadeMask"><rect width="100%" height="100%" fill="white"/>' +
      '<rect width="15%" height="100%" fill="url(#fadeL)"/><rect x="85%" width="15%" height="100%" fill="url(#fadeR)"/></mask>';
  }

  var decorEl = '';
  if (state.underline.enabled || state.overline.enabled) {
    var fw = state.effects.bold ? Math.max(state.fontWeight, 700) : state.fontWeight;
    var tw = measureTextWidth(text, fontFamily, state.fontSize, fw, state.letterSpacing);
    if (state.underline.enabled) decorEl += buildLineDecor(tw, textY + state.fontSize * 0.12, state.underline);
    if (state.overline.enabled)  decorEl += buildLineDecor(tw, textY - state.fontSize * 0.88, state.overline);
  }

  var innerGroup = '<g style="' + animStyle + '">' + textEl + decorEl + '</g>';
  if (state.marqueeFade) innerGroup = '<g style="mask:url(#fadeMask)">' + innerGroup + '</g>';

  var defsStr    = defsContent ? '<defs>' + defsContent + '</defs>' : '';
  var styleBlock = '<style>' + fontFaces + 'text{' + textStyles.join(';') + '}' + keyframes + '</style>';
  var svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
    defsStr + styleBlock + innerGroup + '</svg>';

  var b64 = btoa(Array.from(new TextEncoder().encode(svgContent), function(b) { return String.fromCharCode(b); }).join(''));
  el('codeOutput').textContent = '![](data:image/svg+xml;base64,' + b64 + ')';
}

on('fontUrlInput', 'paste',   function() { setTimeout(loadFontFromUrl, 30); });
on('fontUrlInput', 'keydown', function(e) { if (e.key === 'Enter') loadFontFromUrl(); });

on('fontPicker', 'change', function() {
  _customFont = null;
  el('fontUrlInput').value = '';
  updateLivePreview();
});

on('textInput', 'input', updateLivePreview);

on('fontSize', 'input', function(e) { state.fontSize = parseInt(e.target.value) || 42; updateLivePreview(); });
on('fontWeight', 'change', function(e) { state.fontWeight = parseInt(e.target.value); updateLivePreview(); });

function bindColorPair(colorId, hexId, stateKey) {
  on(colorId, 'input', function(e) {
    state[stateKey] = e.target.value;
    el(hexId).value = e.target.value;
    updateLivePreview();
  });
  on(hexId, 'input', function(e) {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      state[stateKey] = e.target.value;
      el(colorId).value = e.target.value;
      updateLivePreview();
    }
  });
}
bindColorPair('solidColor',    'solidColorHex',    'solidColor');
bindColorPair('gradientStart', 'gradientStartHex', 'gradientStart');
bindColorPair('gradientEnd',   'gradientEndHex',   'gradientEnd');

function bindOpacity(sliderId, labelId, stateKey) {
  on(sliderId, 'input', function(e) {
    state[stateKey] = parseFloat(e.target.value);
    el(labelId).textContent = Math.round(state[stateKey] * 100) + '%';
    updateLivePreview();
  });
}
bindOpacity('solidOpacity',    'solidOpacityValue',    'solidOpacity');
bindOpacity('gradientOpacity', 'gradientOpacityValue', 'gradientOpacity');
bindOpacity('glowOpacity',     'glowOpacityValue',     'glowOpacity');
bindOpacity('shadowOpacity',   'shadowOpacityValue',   'shadowOpacity');

on('letterSpacing', 'input', function(e) {
  state.letterSpacing = parseInt(e.target.value);
  el('spacingValue').textContent = state.letterSpacing + 'px';
  updateLivePreview();
});

on('underlineColor',     'input', function(e) { state.underline.color = e.target.value; updateLivePreview(); });
on('underlineThickness', 'input', function(e) { state.underline.thickness = parseInt(e.target.value) || 2; updateLivePreview(); });
on('overlineColor',      'input', function(e) { state.overline.color = e.target.value; updateLivePreview(); });
on('overlineThickness',  'input', function(e) { state.overline.thickness = parseInt(e.target.value) || 2; updateLivePreview(); });

on('outlineColor', 'input', function(e) { state.outlineColor = e.target.value; updateLivePreview(); });
on('outlineWidth', 'input', function(e) { state.outlineWidth = parseFloat(e.target.value) || 1; updateLivePreview(); });

on('glowColor', 'input', function(e) { state.glowColor = e.target.value; updateLivePreview(); });
on('glowSize',  'input', function(e) { state.glowSize = parseInt(e.target.value) || 5; updateLivePreview(); });

on('shadowColor', 'input', function(e) { state.shadowColor = e.target.value; updateLivePreview(); });
on('shadowBlur',  'input', function(e) { state.shadowBlur = parseInt(e.target.value) || 0; updateLivePreview(); });
on('shadowX',     'input', function(e) { state.shadowX = parseInt(e.target.value) || 0; updateLivePreview(); });
on('shadowY',     'input', function(e) { state.shadowY = parseInt(e.target.value) || 0; updateLivePreview(); });

on('animSpeed', 'input', function(e) {
  state.animSpeed = parseFloat(e.target.value);
  el('speedLabel').textContent = state.animSpeed + 's';
  updateLivePreview();
});

on('underlineEnabled', 'change', function() { toggleDecoration('underline'); });
on('overlineEnabled',  'change', function() { toggleDecoration('overline'); });
on('outlineEnabled',   'change', toggleOutline);
on('glowEnabled',      'change', toggleGlow);
on('shadowEnabled',    'change', toggleShadow);
on('marqueeFade',      'change', function(e) { state.marqueeFade = e.target.checked; updateLivePreview(); });

document.querySelectorAll('[data-color]').forEach(function(b) {
  b.addEventListener('click', function() { setColorMode(b.dataset.color); });
});
document.querySelectorAll('.direction-btn').forEach(function(b) {
  b.addEventListener('click', function() { setGradientDir(b.dataset.dir); });
});
document.querySelectorAll('[data-effect]').forEach(function(b) {
  b.addEventListener('click', function() { toggleEffect(b.dataset.effect); });
});
document.querySelectorAll('.underline-style').forEach(function(b) {
  b.addEventListener('click', function() { setUnderlineStyle(b.dataset.ulstyle); });
});
document.querySelectorAll('.overline-style').forEach(function(b) {
  b.addEventListener('click', function() { setOverlineStyle(b.dataset.olstyle); });
});
document.querySelectorAll('[data-mtype]').forEach(function(b) {
  b.addEventListener('click', function() { setMarqueeType(b.dataset.mtype); });
});

on('embedBtn', 'click', embedFont);
on('copyBtn',  'click', copyFromOutput);
on('gifBtn',   'click', saveAsGif);

updateLivePreview();

function saveAsGif() {
  var codeText = el('codeOutput').textContent;
  if (!codeText) { setStatus('Generate the SVG first.'); return; }

  var match = codeText.match(/data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/);
  if (!match) { setStatus('No SVG found.'); return; }

  var svgContent = atob(match[1]);

  var wMatch = svgContent.match(/width="(\d+)"/);
  var hMatch = svgContent.match(/height="(\d+)"/);
  var W = wMatch ? parseInt(wMatch[1]) : 700;
  var H = hMatch ? parseInt(hMatch[1]) : 80;

  var fps = 20;
  var totalFrames = Math.min(Math.ceil(state.animSpeed * fps), 300);
  var frameDelay = Math.round(state.animSpeed * 1000 / totalFrames);

  setStatus('Loading GIF encoder…');
  el('gifBtn').disabled = true;

  fetch('https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js')
    .then(function(r) { return r.blob(); })
    .then(function(workerBlob) {
      var workerUrl = URL.createObjectURL(workerBlob);

      var gif = new window.GIF({
        workers: 2,
        quality: 10,
        width: W,
        height: H,
        workerScript: workerUrl,
        transparent: 0x000000
      });

      var canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      var framesAdded = 0;

      function buildFrameSvg(progress) {
        var x = state.marqueeType === 'ltr'
          ? Math.round(-W + 2 * W * progress)
          : Math.round(W - 2 * W * progress);
        return svgContent.replace(
          /style="animation:marq[^"]*"/,
          'transform="translate(' + x + ',0)"'
        );
      }

      gif.on('progress', function(p) {
        setStatus('Encoding GIF… ' + Math.round(p * 100) + '%');
      });

      gif.on('finished', function(blob) {
        URL.revokeObjectURL(workerUrl);
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'marquee.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
        el('gifBtn').disabled = false;
        setStatus('GIF saved!');
      });

      function processFrame(i) {
        if (i >= totalFrames) {
          if (framesAdded === 0) {
            URL.revokeObjectURL(workerUrl);
            el('gifBtn').disabled = false;
            setStatus('Error: no frames could be captured.');
            return;
          }
          setStatus('Encoding GIF…');
          gif.render();
          return;
        }
        var frameSvg = buildFrameSvg(i / totalFrames);
        var blob = new Blob([frameSvg], { type: 'image/svg+xml;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var img = new Image();
        img.onload = function() {
          ctx.clearRect(0, 0, W, H);
          ctx.drawImage(img, 0, 0, W, H);
          try {
            var id = ctx.getImageData(0, 0, W, H);
            var d = id.data;
            for (var j = 0; j < d.length; j += 4) {
              if (d[j + 3] < 128) { d[j] = 0; d[j+1] = 0; d[j+2] = 0; d[j+3] = 255; }
            }
            ctx.putImageData(id, 0, 0);
          } catch(e) { /* fallback to original image */ }
          gif.addFrame(ctx, { copy: true, delay: frameDelay });
          URL.revokeObjectURL(url);
          framesAdded++;
          setStatus('Capturing frame ' + framesAdded + '/' + totalFrames + '…');
          processFrame(i + 1);
        };
        img.onerror = function() {
          URL.revokeObjectURL(url);
          processFrame(i + 1);
        };
        img.src = url;
      }

      processFrame(0);
    })
    .catch(function(err) {
      el('gifBtn').disabled = false;
      setStatus('Error: ' + (err && err.message ? err.message : String(err)));
    });
}
