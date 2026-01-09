import path from 'path';
import { createStrapiClient } from '../shared/api.js';
import { loadAllMarkdown } from '../shared/file-helpers.js';
import { uploadImageFromSource } from '../shared/image-upload.js';
import { markdownToBlocks } from '../shared/utils.js';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const GEKO_ROOT = path.resolve('../../../../geko-verein');
const SOURCE_DIR = path.join(GEKO_ROOT, 'collections/_announcements');

const api = createStrapiClient(STRAPI_URL, STRAPI_TOKEN);

function loadAnnouncementFiles() {
  return loadAllMarkdown(SOURCE_DIR).map((entry) => ({
    slug: entry.slug,
    ...entry.data,
    content: entry.content,
  }));
}

function buildPayload(data) {
  return {
    title: data.title || '',
    teaser_text: data.teaser_text || '',
    event_date: data.event_date || null,
    when_text: data.when_text || '',
    where_address: data.where_address || '',
    event_host: data.event_host || '',
    content: markdownToBlocks(data.content),
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
    const imageId = await uploadImageFromSource({
      api,
      rootDir: GEKO_ROOT,
      relativePath: payload.imageSource,
      folderName: 'Announcements',
      altText: payload.imageAlt,
    });
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

