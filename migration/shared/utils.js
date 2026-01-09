export function bool(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (['true', '1', 'yes'].includes(lowered)) return true;
    if (['false', '0', 'no'].includes(lowered)) return false;
  }
  return Boolean(value);
}

export function sanitizeText(value) {
  if (!value) return '';
  return value
    .replace(/\{%.*?%\}/gs, '')
    .trim();
}

export function markdownToBlocks(markdown) {
  const text = sanitizeText(markdown || '').replace(/\r\n/g, '\n').trim();
  if (!text) {
    return null;
  }

  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((paragraphText) => ({
      type: 'paragraph',
      children: [{ type: 'text', text: paragraphText }],
    }));
}






