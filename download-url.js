// download-url.js - Builds the public Nhost Storage download URL for a save file

const STORAGE_ENDPOINT = 'https://riexiuwkfkxlgxuurqeq.storage.ap-south-1.nhost.run/v1/files';

export function getDownloadUrl(fileId) {
  if (!fileId) {
    return '';
  }
  return `${STORAGE_ENDPOINT}/${encodeURIComponent(String(fileId).trim())}`;
}
