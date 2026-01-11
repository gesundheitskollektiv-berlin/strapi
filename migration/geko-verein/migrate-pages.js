import path from 'path';
import { fileURLToPath } from 'url';
import { createStrapiClient } from '../shared/api.js';
import { readMarkdownFile } from '../shared/file-helpers.js';
import { uploadImageFromSource } from '../shared/image-upload.js';
import { markdownToBlocks } from '../shared/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const GEKO_ROOT = '/home/andi/Repositories/coderat/geko/geko-verein';
const PAGES_DIR = path.join(GEKO_ROOT, 'collections/_pages');
const SETTINGS_DIR = path.join(GEKO_ROOT, 'collections/_page_settings');
const LOCALES = ['de', 'en', 'fr', 'ar', 'tr'];

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
      content: markdownToBlocks(file.content),
    },
  };

  try {
    await api.put(`/api/${apiEndpoint}`, payload);
    console.log(`✓ ${pageName} (de)`);
  } catch (error) {
    console.error(`✗ ${pageName}:`, error.response?.data || error.message);
  }
}

async function migrateAboutPage() {
  console.log('\n=== Migrating About Page ===\n');

  // Check if about page exists
  try {
    const checkResponse = await api.get('/api/geko-page-about');
    console.log('About page exists, will update it');
  } catch (error) {
    console.log('About page does not exist or is not accessible:', error.response?.status);
  }

  // Extract image path from one of the files to get the team image
  const deFile = readMarkdownFile(path.join(PAGES_DIR, 'about_us.de.md'));
  let teamImageId = null;
  
  if (deFile) {
    // Extract image path from markdown (look for gruppenfoto_geko)
    const imageMatch = deFile.content.match(/path="([^"]*gruppenfoto[^"]*)"/);
    if (imageMatch) {
      const imagePath = imageMatch[1];
      teamImageId = await uploadImageFromSource({
        api,
        rootDir: GEKO_ROOT,
        relativePath: imagePath,
        folderName: 'Pages',
        altText: 'Geko Team',
      });
    }
  }

  // Migrate each locale
  for (const locale of LOCALES) {
    const fileName = `about_us.${locale}.md`;
    const filePath = path.join(PAGES_DIR, fileName);
    const file = readMarkdownFile(filePath);

    if (!file) {
      console.log(`  ⚠ ${fileName} not found, skipping`);
      continue;
    }

    // Remove image include from content
    let content = file.content;
    content = content.replace(/\{%\s*include\s+responsive_images\/image\.html[^}]*%\}/g, '');
    content = content.replace(/\{%\s*include\s+materials\.html[^}]*%\}/g, '');
    content = content.trim();

    const payload = {
      title: file.data.title || 'Über uns',
      navbar_link: true,
      content: markdownToBlocks(content),
    };

    if (teamImageId && locale === 'de') {
      payload.team_image = teamImageId;
    }

    try {
      // Use params object for locale (same pattern as landing blocks migration)
      await api.put('/api/geko-page-about', 
        { data: payload }, 
        { params: { locale } }
      );
      console.log(`  ✓ About page (${locale})`);
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      const errorDetails = error.response?.data?.error?.details || '';
      console.error(`  ✗ About page (${locale}): ${errorMsg}`, errorDetails ? JSON.stringify(errorDetails) : '');
    }
  }
}

async function migrateAll() {
  await migrateMeta();
  await migratePage('impressum', 'geko-page-impressum');
  await migratePage('datenschutzerklärung', 'geko-page-datenschutzerklaerung');
  await migrateAboutPage();
  console.log('\n✓ Migration complete!');
}

migrateAll();






