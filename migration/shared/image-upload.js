import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const folderCache = new Map();
const fileCache = new Map();

async function ensureFolder(api, folderName) {
  if (!folderName) return null;
  if (folderCache.has(folderName)) return folderCache.get(folderName);

  try {
    const { data } = await api.get('/api/upload/folders', {
      params: {
        'filters[name][$eq]': folderName,
        'pagination[pageSize]': 1,
      },
    });

    if (data?.data?.length) {
      const folderId = data.data[0].id;
      folderCache.set(folderName, folderId);
      return folderId;
    }

    const response = await api.post('/api/upload/folders', {
      name: folderName,
    });
    const folderId = response.data.id;
    folderCache.set(folderName, folderId);
    return folderId;
  } catch (error) {
    console.error(`✗ Unable to ensure folder "${folderName}":`, error.response?.data || error.message);
    return null;
  }
}

export async function uploadImageFromSource({
  api,
  rootDir,
  relativePath,
  folderName,
  altText = '',
}) {
  if (!relativePath) return null;

  const cacheKey = `${folderName || 'default'}::${relativePath}`;
  if (fileCache.has(cacheKey)) return fileCache.get(cacheKey);

  const cleanPath = relativePath.startsWith('/')
    ? relativePath.replace(/^\/+/, '')
    : relativePath;
  const fullPath = path.join(rootDir, cleanPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ Image not found: ${relativePath}`);
    fileCache.set(cacheKey, null);
    return null;
  }

  try {
    const folderId = await ensureFolder(api, folderName);

    const formData = new FormData();
    formData.append('files', fs.createReadStream(fullPath));
    formData.append('fileInfo', JSON.stringify({
      alternativeText: altText || path.basename(cleanPath),
      name: path.basename(cleanPath),
    }));
    if (folderId) {
      formData.append('folder', folderId);
    }

    const response = await api.post('/api/upload', formData, {
      headers: formData.getHeaders(),
    });

    const fileId = response.data[0].id;
    fileCache.set(cacheKey, fileId);
    console.log(`  ✓ Uploaded: ${cleanPath} → ${folderName || 'root'}`);
    return fileId;
  } catch (error) {
    console.error(`  ✗ Failed to upload ${cleanPath}:`, error.response?.data || error.message);
    fileCache.set(cacheKey, null);
    return null;
  }
}

