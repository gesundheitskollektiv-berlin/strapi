import path from 'path';
import { createStrapiClient } from '../shared/api.js';
import { loadLocalizedEntries } from '../shared/file-helpers.js';
import { uploadImageFromSource } from '../shared/image-upload.js';
import { bool, sanitizeText, markdownToBlocks } from '../shared/utils.js';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const GEKO_ROOT = path.resolve('../../../../geko-verein');
const SERVICES_DIR = path.join(GEKO_ROOT, 'collections/_services');
const LOCALES = ['de', 'en', 'fr', 'ro', 'tr', 'ar'];

const api = createStrapiClient(STRAPI_URL, STRAPI_TOKEN);

function buildPayload(data) {
  const isExternal = bool(data.external_service || data.external_link_only, false);

  return {
    title: data.title || 'Ohne Titel',
    icon_name: data.icon ? path.basename(data.icon) : (data.icon_name || null),
    inhouse: bool(data.inhouse, true),
    external_link_only: isExternal,
    project_url: data.project_url || null,
    description: markdownToBlocks(data.blurb || data.description || ''),
    languages: sanitizeText(data.languages || ''),
    offer: markdownToBlocks(data.offer || ''),
    when: sanitizeText(data.when || ''),
    who: markdownToBlocks(data.who || ''),
    where_address: sanitizeText(data.where_address || ''),
  };
}

async function createService(slug, localesData) {
  const baseLocale = localesData.de ? 'de' : Object.keys(localesData)[0];
  if (!baseLocale) {
    console.log(`⚠ No locales for ${slug}, skipping`);
    return;
  }

  const baseData = localesData[baseLocale];
  const payload = buildPayload(baseData);
  payload.locale = baseLocale;

  if (!bool(baseData.external_service || baseData.external_link_only, false)) {
    const imageId = await uploadImageFromSource({
      api,
      rootDir: GEKO_ROOT,
      relativePath: baseData.featured_image,
      folderName: 'Services',
      altText: baseData.featured_image_alt,
    });
    if (imageId) payload.image = imageId;
  }

  try {
    const response = await api.post('/api/geko-services', { data: payload });
    const baseEntry = response.data.data;
    const documentId = baseEntry.documentId;
    console.log(`✓ Created service ${slug} (${baseLocale}) -> ${baseEntry.id}`);

    for (const locale of LOCALES) {
      if (locale === baseLocale) continue;
      if (!localesData[locale]) continue;

      const localizedPayload = buildPayload(localesData[locale]);

      try {
        await api.put(`/api/geko-services/${documentId}?locale=${locale}`, { data: localizedPayload });
        console.log(`  ↳ Added ${locale}`);
      } catch (error) {
        console.error(`  ✗ Failed ${locale}:`, error.response?.data || error.message);
      }
    }
  } catch (error) {
    console.error(`✗ Failed to create service ${slug}:`, error.response?.data || error.message);
  }
}

async function migrateServices() {
  console.log('\n=== Migrating Services ===\n');
  const services = loadLocalizedEntries(SERVICES_DIR, LOCALES);
  const slugs = Object.keys(services);
  console.log(`Found ${slugs.length} service groups\n`);

  for (const slug of slugs) {
    console.log(`Processing ${slug}`);
    await createService(slug, services[slug]);
  }

  console.log('\n✓ Service migration complete!');
}

migrateServices();






