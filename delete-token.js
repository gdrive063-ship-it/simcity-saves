// delete-token.js - Handles copying the one-time delete token to the clipboard

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export function initCopyTokenButton(buttonEl, tokenEl) {
  if (!buttonEl || !tokenEl) return;
  let resetTimer = null;

  buttonEl.addEventListener('click', async () => {
    const token = (tokenEl.textContent || '').trim();
    if (!token) return;

    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(token);
        copied = true;
      } catch {
        copied = fallbackCopy(token);
      }
    } else {
      copied = fallbackCopy(token);
    }

    if (resetTimer) clearTimeout(resetTimer);
    buttonEl.textContent = copied ? 'Copied' : 'Copy manually';
    resetTimer = setTimeout(() => {
      buttonEl.textContent = 'Copy token';
    }, 2000);
  });
}
