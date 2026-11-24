// sort-search.js - Filters and sorts save lists by query, newest, downloads, or days survived

function toTimestamp(save) {
  const raw = save.uploadedAt || save.createdAt || save.date || '';
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function filterSaves(saves, query) {
  const list = Array.isArray(saves) ? saves : [];
  const term = typeof query === 'string' ? query.trim().toLowerCase() : '';
  if (!term) {
    return list.slice();
  }
  return list.filter((save) => {
    const title = String(save.title || '').toLowerCase();
    const desc = String(save.description || '').toLowerCase();
    return title.includes(term) || desc.includes(term);
  });
}

export function sortSaves(saves, sortBy) {
  const list = Array.isArray(saves) ? saves.slice() : [];
  if (sortBy === 'most-downloaded') {
    return list.sort((a, b) => (Number(b.downloads) || 0) - (Number(a.downloads) || 0));
  }
  if (sortBy === 'days-survived') {
    return list.sort((a, b) => (Number(b.simDay) || 0) - (Number(a.simDay) || 0));
  }
  return list.sort((a, b) => toTimestamp(b) - toTimestamp(a));
}

export function filterAndSortSaves(saves, options = {}) {
  const filtered = filterSaves(saves, options.query || '');
  return sortSaves(filtered, options.sortBy || 'newest');
}
