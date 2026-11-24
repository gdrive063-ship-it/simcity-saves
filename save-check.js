// save-check.js - Validates uploaded JSON files against the required Vij save structure

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function validateSaveData(rawText) {
  if (typeof rawText !== 'string' || rawText.trim().length === 0) {
    return { ok: false, error: 'The selected file is empty. Choose a valid Vij .json save file.' };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'That file is not valid JSON. Choose a .json save exported from Vij.' };
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, error: 'The save file must contain a JSON object at the top level.' };
  }

  if (parsed.vijSave !== true) {
    return { ok: false, error: 'This JSON file is missing vijSave: true and cannot be uploaded as a Vij save.' };
  }

  if (typeof parsed.gameVersion !== 'string' || parsed.gameVersion.trim().length === 0) {
    return { ok: false, error: 'This save is missing a valid gameVersion text field.' };
  }

  if (typeof parsed.simDay !== 'number' || !Number.isFinite(parsed.simDay) || parsed.simDay < 0) {
    return { ok: false, error: 'This save is missing a valid simDay number.' };
  }

  if (typeof parsed.citizensAlive !== 'number' || !Number.isFinite(parsed.citizensAlive) || parsed.citizensAlive < 0) {
    return { ok: false, error: 'This save is missing a valid citizensAlive number.' };
  }

  if (!isPlainObject(parsed.summary)) {
    return { ok: false, error: 'This save is missing a valid summary object.' };
  }

  return { ok: true, data: parsed };
}
