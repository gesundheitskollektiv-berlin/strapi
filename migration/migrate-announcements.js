import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const SOURCE_DIR = '../../../geko-verein/collections/_announcements';
const LOCALES = ['de', 'en', 'fr', 'ro', 'tr', 'ar'];

const api = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    Authorization: `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

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
  };
}

async function createAnnouncement(data) {
  const payload = buildPayload(data);

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
