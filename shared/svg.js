export function escXML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildWavyPath(width, y, amp, wl) {
  const segs = Math.ceil((width * 2) / wl) + 2;
  let path = `M 0 ${y} q ${wl / 4} ${-amp} ${wl / 2} 0`;
  for (let i = 1; i < segs; i++) path += ` t ${wl / 2} 0`;
  return path;
}

export function buildLineDecor(width, y, decor) {
  if (decor.style === 'wavy') {
    const amp = decor.thickness * 1.5, wl = decor.thickness * 4;
    return `<path d="${buildWavyPath(width, y, amp, wl)}" fill="none" stroke="${decor.color}" stroke-width="${decor.thickness}"/>`;
  }
  const dash = decor.style === 'dashed' ? ` stroke-dasharray="${decor.thickness * 3} ${decor.thickness * 2}"` : '';
  return `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${decor.color}" stroke-width="${decor.thickness}"${dash}/>`;
}
