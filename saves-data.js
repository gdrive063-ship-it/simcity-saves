// saves-data.js - Single source of save records (returns empty array until backend is connected)

export function getSaves() {
  return [];
}

export function getSaveById(id) {
  if (!id) {
    return null;
  }
  const saves = getSaves();
  return saves.find((save) => String(save.id) === String(id)) || null;
}
