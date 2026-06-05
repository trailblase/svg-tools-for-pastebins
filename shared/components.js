const _NAV = [
  { key: 'svg-generator',  href: '../svg-generator/',                   label: 'SVG Generator' },
  { key: 'gradient-text',  href: '../gradient-text/gradient-text.html', label: 'Gradient Text' },
  { key: 'dividers',       href: '../dividers/dividers.html',           label: 'Dividers'      },
  { key: 'spotify-widget', href: '../spotify-widget/',                  label: 'Spotify Widget' },
  { key: 'circle-widget',  href: '../circle-widget/',                   label: 'Circle Widget' },
  { key: 'experimental',   href: '../experimental/',                    label: 'Experimental'  },
  { key: 'border-viewer', href: '../border-viewer/',                   label: 'Border Viewer' },
];

function toggleTheme() {
  const html = document.documentElement;
  const t = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', t);
  localStorage.setItem('rentried-theme', t);
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = t === 'dark' ? '[L]' : '[D]';
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const activePage = this.getAttribute('active-page') || '';
    const theme = localStorage.getItem('rentried-theme') || 'light';
    const themeIcon = theme === 'dark' ? '[L]' : '[D]';

    const desktopLinks = _NAV.map((item, i) => {
      const active = item.key === activePage ? ' active' : '';
      const sep = i > 0 ? '<span class="nav-sep">·</span>' : '';
      return `${sep}<a href="${item.href}" class="nav-link${active}">${item.label}</a>`;
    }).join('');

    const dropdownItems = _NAV.map(item => {
      const active = item.key === activePage ? ' active' : '';
      return `<li><a class="nav-dropdown-item${active}" href="${item.href}">${item.label}</a></li>`;
    }).join('');

    const activeItem = _NAV.find(item => item.key === activePage);
    const activeLabel = activeItem ? activeItem.label : 'Menu';

    const showNotice = !localStorage.getItem('rentried-notice-dismissed');

    this.innerHTML = `
      <header class="site-header">
        <a href="../" class="site-logo">Trailblase</a>
        <span class="nav-sep d-none d-md-inline">·</span>
        <nav class="site-nav d-none d-md-flex">${desktopLinks}</nav>
        <div class="dropdown d-md-none ms-2">
          <button class="nav-dropdown-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">${activeLabel}</button>
          <ul class="nav-dropdown-menu dropdown-menu">${dropdownItems}</ul>
        </div>
        <button class="theme-toggle" aria-label="Toggle theme" data-tip="toggle theme">${themeIcon}</button>
      </header>
      ${showNotice ? `
      <div class="site-notice" id="siteNotice">
        <span class="notice-msg">Please don't sell codes from this website. Using codes from this website for rentry commissions is fine as long as you don't charge anything for it from your customer. This website was made so people have an easy time customizing their code.</span>
        <button class="notice-close" aria-label="Dismiss">×</button>
      </div>` : ''}
      <div class="site-notice site-notice--stance">
        <span class="notice-msg">The owner of this website doesn't support Zionism and Pro-Israeli actions. Please don't use my website for profanity and targeted harm towards Palestinians and Pro-Israeli rhetoric.</span>
      </div>`;

    this.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

    const noticeClose = this.querySelector('.notice-close');
    if (noticeClose) {
      noticeClose.addEventListener('click', () => {
        document.getElementById('siteNotice').remove();
        localStorage.setItem('rentried-notice-dismissed', '1');
      });
    }
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <div class="page">
          Not affiliated with Rentry.co · Made by <a href="https://github.com/trailblase" target="_blank">trailblase</a> · <a href="https://orion.atabook.org/" target="_blank">Contact / Issues</a>
        </div>
      </footer>`;
  }
}

customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);

const _STAR_DEFS = [
  { vb: 9,  r: [[4,0,1,9],[0,4,9,1],[1,1,1,1],[7,1,1,1],[1,7,1,1],[7,7,1,1]] },
  { vb: 9,  r: [[3,0,3,9],[0,3,9,3]] },
  { vb: 9,  r: [[4,0,1,9],[0,4,9,1],[1,1,2,2],[6,1,2,2],[1,6,2,2],[6,6,2,2]] },
  { vb: 7,  r: [[3,0,1,7],[0,3,7,1]] },
  { vb: 9,  r: [[4,0,1,2],[3,2,3,1],[1,3,1,3],[7,3,1,3],[3,6,3,1],[4,7,1,2],[2,4,5,1],[4,2,1,5]] },
];

function _makePixelStar(size) {
  const ns = 'http://www.w3.org/2000/svg';
  const color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#000';
  const def = _STAR_DEFS[Math.random() * _STAR_DEFS.length | 0];
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${def.vb} ${def.vb}`);
  svg.setAttribute('shape-rendering', 'crispEdges');
  def.r.forEach(([x, y, w, h]) => {
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('fill', color);
    svg.appendChild(rect);
  });
  return svg;
}

function _spawnStar(x, y) {
  const size = 8 + (Math.random() * 10 | 0);
  const wrap = document.createElement('span');
  wrap.className = 'star-particle';
  wrap.style.cssText = `left:${x}px;top:${y}px;transform:translate(-50%,-50%) rotate(${Math.random() * 60 - 30}deg);`;
  wrap.appendChild(_makePixelStar(size));
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 750);
}

function initCursorTrail() {
  let last = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - last < 90) return;
    last = now;
    _spawnStar(e.clientX, e.clientY);
  });
}

function initCopyPopup() {
  const MSGS = ['rentried!', 'yoink!', 'nice!', 'copied!', 'rentryphobia!', 'rentry :D!'];

  document.addEventListener('click', (e) => {
    if (!e.target.matches('.copy-btn')) return;
    const r = e.target.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top;

    const popup = document.createElement('div');
    popup.className = 'float-popup';
    popup.textContent = MSGS[Math.random() * MSGS.length | 0];
    popup.style.cssText = `left:${cx}px;top:${cy - 4}px;`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);

    for (let i = 0; i < 9; i++) {
      setTimeout(() => _spawnStar(
        cx + (Math.random() - 0.5) * 100,
        cy + (Math.random() - 0.5) * 28
      ), i * 30);
    }
  });
}

if (window.matchMedia('(hover: hover)').matches) initCursorTrail();
initCopyPopup();
