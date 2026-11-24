// changelog.js - Renders the changelog entries using textContent only

import { CHANGELOG } from './changelog-data.js';
import { formatDate } from './format.js';

function formatEntryDate(dateStr) {
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return formatDate(`${dateStr.trim()}T12:00:00`);
  }
  return formatDate(dateStr);
}

export function renderChangelog(containerId = 'changelog-list') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.textContent = '';

  if (!Array.isArray(CHANGELOG) || CHANGELOG.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const msg = document.createElement('p');
    msg.className = 'empty-state-text';
    msg.style.marginBottom = '0';
    msg.textContent = 'No changes recorded yet.';
    empty.appendChild(msg);
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'changelog-list';

  CHANGELOG.forEach((entry) => {
    const card = document.createElement('article');
    card.className = 'changelog-card';

    const header = document.createElement('div');
    header.className = 'changelog-header';

    const version = document.createElement('h2');
    version.className = 'changelog-version';
    version.textContent = `Version ${entry.version || '0.0.0'}`;

    const date = document.createElement('time');
    date.className = 'changelog-date';
    if (entry.date) date.setAttribute('datetime', String(entry.date));
    date.textContent = formatEntryDate(entry.date);

    header.append(version, date);
    card.appendChild(header);

    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    const ul = document.createElement('ul');
    ul.className = 'changelog-changes';
    changes.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = String(item);
      ul.appendChild(li);
    });
    card.appendChild(ul);
    list.appendChild(card);
  });

  container.appendChild(list);
}
