import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const SOURCE_DIR = '../../../geko-verein/collections/_announcements';

const api = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function migrateAnnouncements() {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.md'));
  
  console.log(`Found ${files.length} announcement files`);

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);

    const payload = {
      data: {
        title: frontmatter.title || '',
        teaser_text: frontmatter.teaser_text || '',
        event_date: frontmatter.event_date || null,
        when_text: frontmatter.when_text || '',
        where_address: frontmatter.where_address || '',
        event_host: frontmatter.event_host || '',
        content: content.trim(),
        publish_date: frontmatter.publish_date || null,
        locale: 'de',
        publishedAt: frontmatter.publish ? new Date() : null
      }
    };

    try {
      const response = await api.post('/api/geko-announcements', payload);
      console.log(`✓ Imported: ${frontmatter.title}`);
    } catch (error) {
      console.error(`✗ Failed: ${file}`, error.response?.data || error.message);
    }
  }

  console.log('Migration complete!');
}

migrateAnnouncements();

