// upload-form.js - Validates Vij save uploads, previews stats, and submits saves to Nhost

import { initCopyTokenButton } from './delete-token.js';
import { renderStatsPanel } from './render.js';
import { validateSaveData } from './save-check.js';
import { insertSave } from './saves-data.js';
import { uploadSaveFile } from './storage-upload.js';
import { createDeleteTokenPair } from './token-hash.js';

const MAX_TITLE = 80;
const MAX_DESC = 500;
const $ = (id) => document.getElementById(id);

function setFieldError(inputEl, errorEl, message) {
  errorEl.textContent = message || '';
  errorEl.classList.toggle('hidden', !message);
  if (message) inputEl.setAttribute('aria-invalid', 'true');
  else inputEl.removeAttribute('aria-invalid');
}

function checkText(inputEl, errorEl, countEl, maxLen, requiredMsg) {
  const val = inputEl.value;
  countEl.textContent = `${val.length} / ${maxLen}`;
  if (requiredMsg && val.trim().length === 0) return setFieldError(inputEl, errorEl, requiredMsg), false;
  if (val.length > maxLen) return setFieldError(inputEl, errorEl, `Must be ${maxLen} characters or fewer.`), false;
  return setFieldError(inputEl, errorEl, ''), true;
}

export function initUploadForm() {
  const form = $('upload-form');
  if (!form) return;

  const titleEl = $('save-title');
  const descEl = $('save-description');
  const fileEl = $('save-file');
  const fileError = $('file-error');
  const submitBtn = $('upload-submit');
  const statusEl = $('upload-status');
  const errorEl = $('upload-error');
  const tokenBox = $('token-box');
  const tokenValue = $('delete-token-value');
  const copyBtn = $('copy-token-btn');

  initCopyTokenButton(copyBtn, tokenValue);
  let parsedSave = null;
  let selectedFile = null;

  const checkTitle = () => checkText(titleEl, $('title-error'), $('title-count'), MAX_TITLE, 'Please enter a title for your city.');
  const checkDesc = () => checkText(descEl, $('description-error'), $('description-count'), MAX_DESC, '');

  function clearFilePreview() {
    parsedSave = null;
    selectedFile = null;
    $('game-version').value = '';
    $('preview-stats').textContent = '';
    $('preview-section').classList.add('hidden');
  }

  async function inspectFile() {
    const file = fileEl.files && fileEl.files[0];
    if (!file) {
      clearFilePreview();
      return setFieldError(fileEl, fileError, 'Please choose a Vij .json save file.'), false;
    }
    if (!file.name.toLowerCase().endsWith('.json')) {
      clearFilePreview();
      return setFieldError(fileEl, fileError, 'Only .json save files exported from Vij are accepted.'), false;
    }
    try {
      const result = validateSaveData(await file.text());
      if (!result.ok) {
        clearFilePreview();
        return setFieldError(fileEl, fileError, result.error), false;
      }
      parsedSave = result.data;
      selectedFile = file;
      $('game-version').value = result.data.gameVersion;
      setFieldError(fileEl, fileError, '');
      renderStatsPanel($('preview-stats'), result.data);
      $('preview-section').classList.remove('hidden');
      return true;
    } catch {
      clearFilePreview();
      return setFieldError(fileEl, fileError, 'Could not read that file. Please try selecting it again.'), false;
    }
  }

  titleEl.addEventListener('input', () => { errorEl.classList.add('hidden'); checkTitle(); });
  descEl.addEventListener('input', () => { errorEl.classList.add('hidden'); checkDesc(); });
  fileEl.addEventListener('change', () => { errorEl.classList.add('hidden'); inspectFile(); });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.classList.add('hidden');
    tokenBox.classList.add('hidden');

    const titleOk = checkTitle();
    const descOk = checkDesc();
    const fileOk = await inspectFile();
    if (!titleOk) return titleEl.focus();
    if (!descOk) return descEl.focus();
    if (!fileOk || !parsedSave || !selectedFile) return fileEl.focus();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';
    statusEl.textContent = 'Uploading save file and saving city stats...';
    statusEl.classList.remove('hidden');

    try {
      const { token, tokenHash } = await createDeleteTokenPair();
      const fileId = await uploadSaveFile(selectedFile);
      const created = await insertSave({
        title: titleEl.value.trim(),
        description: descEl.value.trim(),
        game_version: parsedSave.gameVersion,
        sim_day: Math.trunc(parsedSave.simDay),
        citizens_alive: Math.trunc(parsedSave.citizensAlive),
        summary: parsedSave.summary,
        file_id: fileId,
        size_bytes: selectedFile.size,
        delete_token_hash: tokenHash,
      });

      statusEl.classList.add('hidden');
      tokenValue.textContent = token;
      copyBtn.textContent = 'Copy token';
      $('view-save-link').href = `save.html?id=${encodeURIComponent(created.id)}`;
      tokenBox.classList.remove('hidden');
      form.reset();
      $('title-count').textContent = `0 / ${MAX_TITLE}`;
      $('description-count').textContent = `0 / ${MAX_DESC}`;
      clearFilePreview();
    } catch (err) {
      statusEl.classList.add('hidden');
      errorEl.textContent = err?.message || 'Upload failed. Please try again.';
      errorEl.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Upload save';
    }
  });
}
