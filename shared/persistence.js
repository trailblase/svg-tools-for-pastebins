export function restoreInputs(toolName) {
  const raw = localStorage.getItem('rentried-settings-' + toolName);
  if (!raw) return;
  let data;
  try { data = JSON.parse(raw); } catch (e) { return; }

  Object.keys(data).forEach(id => {
    const el = document.getElementById(id);
    if (!el || el.type === 'file') return;
    if (el.type === 'checkbox') {
      el.checked = !!data[id];
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      el.value = data[id];
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

export function initPersistence(toolName) {
  const key = 'rentried-settings-' + toolName;
  function save(e) {
    const el = e.target;
    if (!el.id || el.type === 'file') return;
    const raw = localStorage.getItem(key);
    let data = {};
    try { if (raw) data = JSON.parse(raw); } catch (e) {}
    data[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    localStorage.setItem(key, JSON.stringify(data));
  }
  document.addEventListener('input', save);
  document.addEventListener('change', save);
}

export function copyFromOutput() {
  const el = document.getElementById('codeOutput') || document.getElementById('output');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    const btn = document.getElementById('copyBtn');
    if (!btn) return;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy Code'; btn.classList.remove('copied'); }, 2000);
  });
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const btn = document.getElementById('copyBtn');
    if (btn) { e.preventDefault(); btn.click(); }
  }
});
