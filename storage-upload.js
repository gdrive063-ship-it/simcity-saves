// storage-upload.js - Uploads validated Vij save files to the Nhost Storage endpoint

const STORAGE_ENDPOINT = 'https://riexiuwkfkxlgxuurqeq.storage.ap-south-1.nhost.run/v1/files';
const NETWORK_ERROR_MSG = 'Could not reach the save server. Check your connection and try again.';

export async function uploadSaveFile(file) {
  const body = new FormData();
  body.append('file', file, file.name);

  let response;
  try {
    response = await fetch(STORAGE_ENDPOINT, {
      method: 'POST',
      body,
    });
  } catch {
    throw new Error(NETWORK_ERROR_MSG);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const serverMsg = payload?.error?.message || payload?.message || `File upload failed (${response.status}).`;
    throw new Error(serverMsg);
  }

  const fileId = payload?.processedFiles?.[0]?.id || payload?.id || payload?.file?.id;
  if (!fileId) {
    throw new Error('The file uploaded, but the server did not return a file ID.');
  }

  return fileId;
}
