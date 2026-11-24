// upload-form.js - Manages upload validation, Vij save file inspection, stats preview, and placeholder submit

import { renderStatsPanel } from './render.js';
import { validateSaveData } from './save-check.js';

const MAX_TITLE = 80;
const MAX_DESC = 500;

function setFieldError(inputEl, errorEl, message) {
  if (message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    inputEl.setAttribute('aria-invalid', 'true');
  } else {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
    inputEl.removeAttribute('aria-invalid');
  }
}

export function initUploadForm() {
  const form = document.getElementById('upload-form');
  if (!form) return;

  const titleInput = document.getElementById('save-title');
  const descInput = document.getElementById('save-description');
  const versionInput = document.getElementById('game-version');
  const fileInput = document.getElementById('save-file');
  const titleCount = document.getElementById('title-count');
  const descCount = document.getElementById('description-count');
  const titleError = document.getElementById('title-error');
  const descError = document.getElementById('description-error');
  const fileError = document.getElementById('file-error');
  const previewSection = document.getElementById('preview-section');
  const previewStats = document.getElementById('preview-stats');
  const uploadStatus = document.getElementById('upload-status');

  let parsedSave = null;

  function validateTitle() {
    const val = titleInput.value;
    titleCount.textContent = `${val.length} / ${MAX_TITLE}`;
    if (val.trim().length === 0) {
      setFieldError(titleInput, titleError, 'Please enter a title for your city.');
      return false;
    }
    if (val.length > MAX_TITLE) {
      setFieldError(titleInput, titleError, `Title must be ${MAX_TITLE} characters or fewer.`);
      return false;
    }
    setFieldError(titleInput, titleError, '');
    return true;
  }

  function validateDescription() {
    const val = descInput.value;
    descCount.textContent = `${val.length} / ${MAX_DESC}`;
    if (val.length > MAX_DESC) {
      setFieldError(descInput, descError, `Description must be ${MAX_DESC} characters or fewer.`);
      return false;
    }
    setFieldError(descInput, descError, '');
    return true;
  }

  function clearFilePreview() {
    parsedSave = null;
    versionInput.value = '';
    previewStats.textContent = '';
    previewSection.classList.add('hidden');
  }

  async function handleFileChange() {
    uploadStatus.classList.add('hidden');
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      clearFilePreview();
      setFieldError(fileInput, fileError, 'Please choose a Vij .json save file.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.json')) {
      clearFilePreview();
      setFieldError(fileInput, fileError, 'Only .json save files exported from Vij are accepted.');
      return;
    }

    try {
      const text = await file.text();
      const result = validateSaveData(text);
      if (!result.ok) {
        clearFilePreview();
        setFieldError(fileInput, fileError, result.error);
        return;
      }
      parsedSave = result.data;
      versionInput.value = result.data.gameVersion;
      setFieldError(fileInput, fileError, '');
      renderStatsPanel(previewStats, result.data);
      previewSection.classList.remove('hidden');
    } catch {
      clearFilePreview();
      setFieldError(fileInput, fileError, 'Could not read that file. Please try selecting it again.');
    }
  }

  titleInput.addEventListener('input', () => {
    uploadStatus.classList.add('hidden');
    validateTitle();
  });

  descInput.addEventListener('input', () => {
    uploadStatus.classList.add('hidden');
    validateDescription();
  });

  fileInput.addEventListener('change', handleFileChange);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    uploadStatus.classList.add('hidden');

    const isTitleValid = validateTitle();
    const isDescValid = validateDescription();
    const isFileValid = Boolean(parsedSave);
    if (!isFileValid && fileError.classList.contains('hidden')) {
      setFieldError(fileInput, fileError, 'Please choose a valid Vij .json save file.');
    }

    if (!isTitleValid) {
      titleInput.focus();
      return;
    }
    if (!isDescValid) {
      descInput.focus();
      return;
    }
    if (!isFileValid) {
      fileInput.focus();
      return;
    }

    uploadStatus.textContent = 'Uploads open soon. Your save is ready.';
    uploadStatus.classList.remove('hidden');
  });
}
