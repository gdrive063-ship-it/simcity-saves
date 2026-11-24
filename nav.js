// nav.js - Builds shared header, footer, and light/dark theme toggle across all SimCity Saves pages

const THEME_KEY = 'simcity-saves-theme';
const SVG_NS = 'http://www.w3.org/2000/svg';
const NAV_ITEMS = [
  { key: 'home', label: 'Home', href: 'index.html' },
  { key: 'browse', label: 'Browse', href: 'browse.html' },
  { key: 'upload', label: 'Upload', href: 'upload.html' },
  { key: 'how', label: 'How to import', href: 'how.html' },
  { key: 'changelog', label: 'Changelog', href: 'changelog.html' },
];

function getActiveTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function svgEl(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function createThemeIcon(isDark) {
  const svg = svgEl('svg', {
    class: 'theme-icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true',
  });
  if (isDark) {
    svg.appendChild(svgEl('circle', { cx: '12', cy: '12', r: '4' }));
    const rays = [
      [12, 2, 12, 4], [12, 20, 12, 22], [4.93, 4.93, 6.34, 6.34], [17.66, 17.66, 19.07, 19.07],
      [2, 12, 4, 12], [20, 12, 22, 12], [6.34, 17.66, 4.93, 19.07], [19.07, 4.93, 17.66, 6.34],
    ];
    rays.forEach(([x1, y1, x2, y2]) => svg.appendChild(svgEl('line', { x1, y1, x2, y2 })));
  } else {
    svg.appendChild(svgEl('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' }));
  }
  return svg;
}

function updateToggleButton(btn, theme) {
  const isDark = theme === 'dark';
  btn.textContent = '';
  const label = document.createElement('span');
  label.textContent = isDark ? 'Light' : 'Dark';
  btn.append(createThemeIcon(isDark), label);
  btn.setAttribute('aria-pressed', String(isDark));
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function createThemeToggle() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  updateToggleButton(btn, getActiveTheme());

  btn.addEventListener('click', () => {
    const next = getActiveTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore storage errors */ }
    updateToggleButton(btn, next);
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (!document.documentElement.getAttribute('data-theme')) updateToggleButton(btn, getActiveTheme());
    });
  }
  return btn;
}

function createNavLinks(activeKey, className) {
  return NAV_ITEMS.map((item) => {
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.label;
    if (className) link.className = className;
    if (item.key === activeKey) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
    return link;
  });
}

function renderHeader(activeKey) {
  const host = document.getElementById('site-header');
  if (!host) return;
  host.className = 'site-header';
  host.textContent = '';

  const container = document.createElement('div');
  container.className = 'container header-inner';
  const brand = document.createElement('a');
  brand.href = 'index.html';
  brand.className = 'site-brand';
  brand.textContent = 'SimCity Saves';

  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Main navigation');
  createNavLinks(activeKey, 'nav-link').forEach((link) => nav.appendChild(link));

  container.append(brand, nav, createThemeToggle());
  host.appendChild(container);
}

function renderFooter(activeKey) {
  const host = document.getElementById('site-footer');
  if (!host) return;
  host.className = 'site-footer';
  host.textContent = '';

  const container = document.createElement('div');
  container.className = 'container footer-inner';
  const copy = document.createElement('p');
  copy.textContent = 'SimCity Saves · Community archive for Vij';

  const links = document.createElement('nav');
  links.className = 'footer-links';
  links.setAttribute('aria-label', 'Footer navigation');
  createNavLinks(activeKey, '').forEach((link) => links.appendChild(link));

  container.append(copy, links);
  host.appendChild(container);
}

export function initNav(activeKey) {
  const key = activeKey || document.body.dataset.nav || 'home';
  renderHeader(key);
  renderFooter(key);
}
