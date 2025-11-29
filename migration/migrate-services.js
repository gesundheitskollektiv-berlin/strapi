import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';
import FormData from 'form-data';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const SERVICES_DIR = '../../../geko-verein/collections/_services';
const ASSETS_DIR = '../../../geko-verein';
const LOCALES = ['de', 'en', 'fr', 'ro', 'tr', 'ar'];

const api = axios.create({
  baseURL: STRAPI_URL,
  headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : undefined,
});
const imageCache = new Map();

const bool = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (['true', '1', 'yes'].includes(lowered)) return true;
    if (['false', '0', 'no'].includes(lowered)) return false;
  }
  return Boolean(value);
};

async function uploadImage(imagePath) {
  if (!imagePath) return null;
  if (imageCache.has(imagePath)) return imageCache.get(imagePath);

  const cleanPath = imagePath.startsWith('/')
    ? imagePath.replace(/^\/+/, '')
    : imagePath;
  const fullPath = path.join(ASSETS_DIR, cleanPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ Image not found: ${imagePath}`);
    imageCache.set(imagePath, null);
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(fullPath));
    formData.append('fileInfo', JSON.stringify({ alternativeText: path.basename(cleanPath) }));

    const response = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
      headers: formData.getHeaders(),
    });

    const id = response.data[0].id;
    imageCache.set(imagePath, id);
    console.log(`  ✓ Uploaded image: ${cleanPath}`);
    return id;
  } catch (error) {
    console.error(`  ✗ Failed to upload ${cleanPath}`, error.response?.data || error.message);
    imageCache.set(imagePath, null);
    return null;
  }
}

function loadServiceFiles() {
  const entries = {};

  const files = fs.readdirSync(SERVICES_DIR).filter((file) => file.endsWith('.md'));
  for (const file of files) {
    const match = file.match(/^(.*)\.([a-z]{2})\.md$/);
    if (!match) continue;

    const [, slug, locale] = match;
    if (!LOCALES.includes(locale)) continue;

    const filepath = path.join(SERVICES_DIR, file);
    const fileContent = fs.readFileSync(filepath, 'utf8');
    const { data } = matter(fileContent);

    if (!entries[slug]) entries[slug] = {};
    entries[slug][locale] = data;
  }

  return entries;
}

function sanitizeText(value) {
  if (!value) return '';
  return value
    .replace(/\\{%.*?%\\}/gs, '')
    .trim();
}

function buildPayload(data, locale) {
  return {
    title: data.title || 'Ohne Titel',
    icon_name: data.icon ? path.basename(data.icon) : (data.icon_name || null),
    inhouse: bool(data.inhouse, true),
    external_link_only: bool(data.external_link_only, false),
    project_url: data.project_url || null,
    description: sanitizeText(data.blurb || data.description || ''),
    languages: sanitizeText(data.languages || ''),
    offer: sanitizeText(data.offer || ''),
    when: sanitizeText(data.when || ''),
    who: sanitizeText(data.who || ''),
    where_address: sanitizeText(data.where_address || ''),
    locale,
  };
}

async function createService(slug, localesData) {
  const baseLocale = localesData.de ? 'de' : Object.keys(localesData)[0];
  if (!baseLocale) {
    console.log(`⚠ No locales for ${slug}, skipping`);
    return;
  }

  const baseData = localesData[baseLocale];
  const featuredImageId = await uploadImage(baseData.featured_image);

  const payload = buildPayload(baseData, baseLocale);
  if (featuredImageId) payload.featured_image = featuredImageId;

  try {
    const response = await api.post('/api/geko-services', { data: payload });
    const baseEntry = response.data.data;
    const baseId = baseEntry.id;
    const documentId = baseEntry.documentId;
    console.log(`✓ Created service ${slug} (${baseLocale}) -> ${baseId}`);

    for (const locale of LOCALES) {
      if (locale === baseLocale) continue;
      if (!localesData[locale]) continue;

      const localizedData = localesData[locale];
      const localizedPayload = buildPayload(localizedData, locale);
      delete localizedPayload.locale;

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
  const services = loadServiceFiles();
  const slugs = Object.keys(services);
  console.log(`Found ${slugs.length} service groups\n`);

  for (const slug of slugs) {
    console.log(`Processing ${slug}`);
    await createService(slug, services[slug]);
  }

  console.log('\n✓ Service migration complete!');
}

migrateServices();

