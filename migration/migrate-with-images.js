import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';
import FormData from 'form-data';

const STRAPI_URL = 'http://localhost:1337';
const SOURCE_DIR = '../../../geko-verein/collections/_announcements';
const ASSETS_DIR = '../../../geko-verein/assets/img';
const FOLDER_ID = 9; // Geko/Announcements folder

const api = axios.create({
  baseURL: STRAPI_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const imageCache = {};

async function uploadImage(imagePath, altText) {
  if (imageCache[imagePath]) {
    return imageCache[imagePath];
  }

  const fullPath = path.join(ASSETS_DIR, path.basename(imagePath));
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠ Image not found: ${path.basename(imagePath)}`);
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(fullPath));
    formData.append('fileInfo', JSON.stringify({ 
      folder: FOLDER_ID,
      alternativeText: altText 
    }));

    const response = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
      headers: formData.getHeaders()
    });

    imageCache[imagePath] = response.data[0].id;
    console.log(`  ✓ Uploaded: ${path.basename(imagePath)}`);
    return response.data[0].id;
  } catch (error) {
    console.error(`  ✗ Failed: ${path.basename(imagePath)}`);
    return null;
  }
}

async function migrateWithImages() {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.md'));
  console.log(`Migrating ${files.length} announcements to folder ${FOLDER_ID}...\n`);

  // Fetch existing announcements
  console.log('Fetching existing announcements...');
  const { data: existing } = await api.get('/api/geko-announcements?locale=de&pagination[pageSize]=1000');
  const existingMap = new Map(existing.data?.map(item => [item.attributes?.title, item.id]) || []);
  console.log(`Found ${existingMap.size} existing announcements\n`);

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);

    const title = frontmatter.title || '';
    const existingId = existingMap.get(title);
    
    console.log(`${existingId ? 'Updating' : 'Creating'}: ${title}`);

    let imageId = null;

    if (frontmatter.featured_image) {
      imageId = await uploadImage(frontmatter.featured_image, title);
    } else if (frontmatter.kicker_image) {
      imageId = await uploadImage(frontmatter.kicker_image, title);
    }

    const payload = {
      data: {
        title,
        image: imageId,
        teaser_text: frontmatter.teaser_text || '',
        event_date: frontmatter.event_date || null,
        when_text: frontmatter.when_text || '',
        where_address: frontmatter.where_address || '',
        event_host: frontmatter.event_host || '',
        content: content.trim(),
        publish_date: frontmatter.publish_date || null,
        locale: 'de',
        publishedAt: frontmatter.publish_date || (frontmatter.publish ? new Date() : null)
      }
    };

    try {
      if (existingId) {
        await api.put(`/api/geko-announcements/${existingId}`, payload);
        console.log(`✓ Updated\n`);
      } else {
        await api.post('/api/geko-announcements', payload);
        console.log(`✓ Created\n`);
      }
    } catch (error) {
      console.error(`✗ Failed:`, error.response?.data || error.message);
      console.log('');
    }
  }

  console.log('Migration complete!');
}

migrateWithImages();
