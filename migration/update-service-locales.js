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

function sanitizeText(value) {
  if (!value) return '';
  return value
    .replace(/{%.*?%}/gs, '')
    .trim();
}

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

function buildPayload(data, locale) {
  return {
    title: data.title || 'Ohne Titel',
    icon_name: data.icon ? path.basename(data.icon) : (data.icon_name || null),
    inhouse: bool(data.inhouse, true),
    external_link_only: bool(data.external_link_only, false),
    project_url: data.project_url || data.external_service_url || null,
    description: sanitizeText(data.blurb || data.description || ''),
    languages: sanitizeText(data.languages || ''),
    offer: sanitizeText(data.offer || ''),
    when: sanitizeText(data.when || ''),
    who: sanitizeText(data.who || ''),
    where_address: sanitizeText(data.where_address || ''),
    locale,
  };
}

async function findEntryByTitle(title, locale) {
  const response = await api.get('/api/geko-services', {
    params: {
      locale,
      'filters[title][$eq]': title,
      'pagination[pageSize]': 1,
    },
  });
  return response.data.data?.[0] || null;
}

async function findEntryByDocument(documentId, locale) {
  const response = await api.get('/api/geko-services', {
    params: {
      locale,
      'filters[documentId][$eq]': documentId,
      'pagination[pageSize]': 1,
    },
  });
  return response.data.data?.[0] || null;
}

async function updateService(slug, localesData) {
  const baseData = localesData.de;
  if (!baseData) {
    console.log(`⚠ No German data for ${slug}, skipping`);
    return;
  }

  const baseEntry = await findEntryByTitle(baseData.title, 'de');
  if (!baseEntry) {
    console.log(`⚠ No existing service found for ${baseData.title}`);
    return;
  }

  const documentId = baseEntry.documentId;
  console.log(`Updating ${slug} (document ${documentId})`);

  const featuredImageId = await uploadImage(baseData.featured_image);

  for (const locale of LOCALES) {
    if (!localesData[locale]) continue;

    const entry = await (locale === 'de'
      ? Promise.resolve(baseEntry)
      : findEntryByDocument(documentId, locale));

    if (!entry) {
      console.log(`  ⚠ ${locale} entry missing, skipping`);
      continue;
    }

    const payload = buildPayload(localesData[locale], locale);
    if (locale === 'de' && featuredImageId) {
      payload.featured_image = featuredImageId;
    }

    try {
      await api.put(`/api/geko-services/${entry.id}`, { data: payload });
      console.log(`  ✓ Updated ${locale}`);
    } catch (error) {
      console.error(`  ✗ Failed ${locale}:`, error.response?.data || error.message);
    }
  }
}

async function updateServices(localizedSlugs) {
  console.log('\n=== Updating service locales ===\n');
  const services = loadServiceFiles();

  for (const slug of localizedSlugs) {
    if (!services[slug]) {
      console.log(`⚠ No files for slug ${slug}`);
      continue;
    }
    await updateService(slug, services[slug]);
  }

  console.log('\n✓ Service locales update complete!');
}

const targetSlugs = process.argv.slice(2);
if (!targetSlugs.length) {
  console.log('Usage: node update-service-locales.js <slug> [slug...]');
  process.exit(1);
}

updateServices(targetSlugs);

