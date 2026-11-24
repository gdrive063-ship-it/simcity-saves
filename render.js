// render.js - Builds save cards, empty/loading states, and stats panels using textContent only

import { formatCurrency, formatDownloads, formatNumber } from './format.js';

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined && text !== null) el.textContent = String(text);
  return el;
}

export function renderEmptyState(container, message, action) {
  if (!container) return;
  container.textContent = '';
  container.removeAttribute('aria-busy');
  const box = createEl('div', 'empty-state');
  box.appendChild(createEl('p', 'empty-state-text', message || 'No saves yet. Be the first to upload one.'));
  if (action && action.href && action.label) {
    const link = createEl('a', 'btn btn-primary', action.label);
    link.href = action.href;
    box.appendChild(link);
  }
  container.appendChild(box);
}

export function renderLoadingState(container, message) {
  if (!container) return;
  container.textContent = '';
  container.setAttribute('aria-busy', 'true');
  const box = createEl('div', 'empty-state');
  box.setAttribute('role', 'status');
  box.appendChild(createEl('p', 'empty-state-text', message || 'Loading saves...'));
  container.appendChild(box);
}

function createMetaItem(label, value) {
  const wrap = createEl('div');
  wrap.append(createEl('span', 'meta-item-label', label), createEl('span', 'meta-item-value', value));
  return wrap;
}

export function renderSaveCard(save) {
  const card = createEl('a', 'save-card');
  card.href = `save.html?id=${encodeURIComponent(String(save.id || ''))}`;

  const top = createEl('div');
  top.appendChild(createEl('h3', 'save-card-title', save.title || 'Untitled city'));
  const descText = save.description && String(save.description).trim()
    ? String(save.description).trim()
    : 'No description provided.';
  top.appendChild(createEl('p', 'save-card-desc', descText));

  const simDay = save.sim_day ?? save.simDay;
  const citizensAlive = save.citizens_alive ?? save.citizensAlive;
  const gameVersion = save.game_version ?? save.gameVersion;

  const meta = createEl('div', 'save-card-meta');
  meta.append(
    createMetaItem('Sim day', formatNumber(simDay)),
    createMetaItem('Citizens alive', formatNumber(citizensAlive)),
    createMetaItem('Game version', gameVersion || 'Unknown'),
    createMetaItem('Downloads', formatDownloads(save.downloads))
  );

  card.append(top, meta);
  return card;
}

export function renderSaveGrid(container, saves, emptyMessage, action) {
  if (!container) return;
  container.textContent = '';
  container.removeAttribute('aria-busy');
  if (!Array.isArray(saves) || saves.length === 0) {
    renderEmptyState(container, emptyMessage, action);
    return;
  }
  const grid = createEl('div', 'saves-grid');
  saves.forEach((save) => grid.appendChild(renderSaveCard(save)));
  container.appendChild(grid);
}

function formatRichestCitizen(summary) {
  const richest = summary && (summary.richestCitizen ?? summary.richest_citizen);
  if (!richest) return 'Not recorded';
  if (typeof richest === 'string') return richest;
  if (typeof richest === 'object') {
    const name = richest.name || 'Unknown';
    const wealth = richest.wealth ?? richest.netWorth ?? richest.cash ?? richest.balance;
    return wealth !== undefined && wealth !== null ? `${name} (${formatCurrency(wealth)})` : String(name);
  }
  return 'Not recorded';
}

export function renderStatsPanel(container, saveData) {
  if (!container || !saveData) return;
  container.textContent = '';
  const summary = saveData.summary && typeof saveData.summary === 'object' ? saveData.summary : {};
  const simDay = saveData.sim_day ?? saveData.simDay;
  const citizensAlive = saveData.citizens_alive ?? saveData.citizensAlive;

  const grid = createEl('div', 'stats-grid');
  const stats = [
    ['Sim day', formatNumber(simDay)],
    ['Citizens alive', formatNumber(citizensAlive)],
    ['Richest citizen', formatRichestCitizen(summary)],
  ];
  stats.forEach(([label, value]) => {
    const box = createEl('div', 'stat-box');
    box.append(createEl('span', 'stat-label', label), createEl('span', 'stat-value', value));
    grid.appendChild(box);
  });
  container.appendChild(grid);

  const companiesWrap = createEl('div', 'companies-block');
  companiesWrap.appendChild(createEl('h3', 'companies-heading', 'Companies'));
  const companies = Array.isArray(summary.companies) ? summary.companies : [];
  if (companies.length === 0) {
    companiesWrap.appendChild(createEl('p', 'field-hint', 'No companies recorded in this save.'));
  } else {
    const list = createEl('ul', 'companies-list');
    companies.forEach((company) => {
      const row = createEl('li', 'company-row');
      if (typeof company === 'string') {
        row.appendChild(createEl('span', '', company));
      } else if (company && typeof company === 'object') {
        row.append(
          createEl('span', '', company.name || 'Unnamed company'),
          createEl('span', 'company-status', company.status || 'Unknown status')
        );
      }
      list.appendChild(row);
    });
    companiesWrap.appendChild(list);
  }
  container.appendChild(companiesWrap);
}
