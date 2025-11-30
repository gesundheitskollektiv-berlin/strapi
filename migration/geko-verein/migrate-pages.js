import path from 'path';
import { createStrapiClient } from '../shared/api.js';
import { readMarkdownFile } from '../shared/file-helpers.js';
import { uploadImageFromSource } from '../shared/image-upload.js';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const GEKO_ROOT = path.resolve('../../../../geko-verein');
const PAGES_DIR = path.join(GEKO_ROOT, 'collections/_pages');
const SETTINGS_DIR = path.join(GEKO_ROOT, 'collections/_page_settings');

const api = createStrapiClient(STRAPI_URL, STRAPI_TOKEN);

async function uploadBanner(imagePath) {
  if (!imagePath) return null;

  return uploadImageFromSource({
    api,
    rootDir: GEKO_ROOT,
    relativePath: imagePath,
    folderName: 'Pages',
    altText: 'Geko Banner',
  });
}

async function migrateMeta() {
  console.log('\n=== Migrating Meta ===');

  const settingsFile = readMarkdownFile(path.join(SETTINGS_DIR, 'page_settings.md'));
  if (!settingsFile) {
    console.log('⚠ page_settings.md not found');
    return;
  }

  const bannerId = await uploadBanner(settingsFile.data.page_banner);

  const payload = {
    data: {
      company: settingsFile.data.company,
      street: settingsFile.data.street,
      postal: settingsFile.data.postal,
      city: settingsFile.data.city,
      phone: settingsFile.data.phone,
      email: settingsFile.data.email,
      press_email: settingsFile.data.press_email,
      facebook: settingsFile.data.facebook,
      twitter: settingsFile.data.twitter,
      instagram: settingsFile.data.instagram,
      page_banner: bannerId,
    },
  };

  try {
    await api.put('/api/geko-meta', payload);
    console.log('✓ Meta migrated');
  } catch (error) {
    console.error('✗ Meta failed:', error.response?.data || error.message);
  }
}

async function migratePage(pageName, apiEndpoint) {
  console.log(`\n=== Migrating ${pageName} ===`);

  const filePath = path.join(PAGES_DIR, `${pageName.toLowerCase()}.de.md`);
  const file = readMarkdownFile(filePath);

  if (!file) {
    console.log(`⚠ File not found: ${pageName}.de.md`);
    return;
  }

  const payload = {
    data: {
      title: file.data.title,
      content: file.content,
    },
  };

  try {
    await api.put(`/api/${apiEndpoint}`, payload);
    console.log(`✓ ${pageName} (de)`);
  } catch (error) {
    console.error(`✗ ${pageName}:`, error.response?.data || error.message);
  }
}

async function migrateAll() {
  await migrateMeta();
  await migratePage('impressum', 'geko-page-impressum');
  await migratePage('datenschutzerklärung', 'geko-page-datenschutzerklaerung');
  console.log('\n✓ Migration complete!');
}

migrateAll();

