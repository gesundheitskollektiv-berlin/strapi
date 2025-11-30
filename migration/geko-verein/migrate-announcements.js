import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';
import FormData from 'form-data';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const SOURCE_DIR = '../../../../geko-verein/collections/_announcements';
const ASSETS_DIR = '../../../../geko-verein';
const LOCALES = ['de', 'en', 'fr', 'ro', 'tr', 'ar'];

const api = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    Authorization: `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

const imageCache = new Map();

async function uploadImage(imagePath, altText = '') {
  if (!imagePath) return null;
  
  const cacheKey = `announcements/${imagePath}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  const cleanPath = imagePath.startsWith('/')
    ? imagePath.replace(/^\/+/, '')
    : imagePath;
  const fullPath = path.join(ASSETS_DIR, cleanPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ Image not found: ${imagePath}`);
    imageCache.set(cacheKey, null);
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(fullPath));
    formData.append('path', 'announcements');
    formData.append('fileInfo', JSON.stringify({ 
      alternativeText: altText || path.basename(cleanPath) 
    }));

    const response = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
    });

    const fileId = response.data[0].id;
    imageCache.set(cacheKey, fileId);
    console.log(`  ✓ Uploaded: ${cleanPath}`);
    return fileId;
  } catch (error) {
    console.error(`  ✗ Upload failed ${cleanPath}:`, error.message);
    imageCache.set(cacheKey, null);
    return null;
  }
}

function loadAnnouncementFiles() {
  const entries = [];
  const files = fs.readdirSync(SOURCE_DIR).filter((f) => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    entries.push({ slug: file.replace('.md', ''), ...data, content: content.trim() });
  }

  return entries;
}

function buildPayload(data) {
  return {
    title: data.title || '',
    teaser_text: data.teaser_text || '',
    event_date: data.event_date || null,
    when_text: data.when_text || '',
    where_address: data.where_address || '',
    event_host: data.event_host || '',
    content: data.content || '',
    is_event: !!data.event_date,
    publishedAt: data.publish_date ? new Date(data.publish_date) : new Date(),
    // Image handling - prefer featured_image, fallback to kicker_image
    imageSource: data.featured_image || data.kicker_image,
    imageAlt: data.featured_image_alt || data.kicker_image_alt || '',
  };
}

async function createAnnouncement(data) {
  const payload = buildPayload(data);
  
  // Upload image if present (prefer featured_image, fallback to kicker_image)
  if (payload.imageSource) {
    const imageId = await uploadImage(payload.imageSource, payload.imageAlt);
    if (imageId) {
      payload.image = imageId;
    }
  }
  
  // Remove temp fields
  delete payload.imageSource;
  delete payload.imageAlt;

  try {
    await api.post('/api/geko-announcements', { data: { ...payload, locale: 'de' } });
    console.log(`✓ Created: ${data.title}`);
  } catch (error) {
    console.error(`✗ Failed ${data.slug}:`, error.response?.data || error.message);
  }
}

async function migrateAnnouncements() {
  console.log('\n=== Migrating Announcements ===\n');
  const announcements = loadAnnouncementFiles();
  console.log(`Found ${announcements.length} announcements\n`);

  for (const entry of announcements) {
    await createAnnouncement(entry);
  }

  console.log('\n✓ Announcement migration complete!');
}

migrateAnnouncements();

