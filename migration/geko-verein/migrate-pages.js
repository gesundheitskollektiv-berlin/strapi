import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';
import FormData from 'form-data';

const STRAPI_URL = 'http://localhost:1337';
const PAGES_DIR = '../../../../geko-verein/collections/_pages';
const SETTINGS_DIR = '../../../../geko-verein/collections/_page_settings';
const ASSETS_DIR = '../../../../geko-verein/assets/img';

const api = axios.create({ baseURL: STRAPI_URL });

async function uploadBanner(imagePath) {
  if (!imagePath) return null;
  
  const fullPath = path.join(ASSETS_DIR, path.basename(imagePath));
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ Banner not found: ${imagePath}`);
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(fullPath));
    formData.append('fileInfo', JSON.stringify({ alternativeText: 'Geko Banner' }));

    const response = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
      headers: formData.getHeaders()
    });
    return response.data[0].id;
  } catch (error) {
    console.error(`✗ Failed to upload banner`);
    return null;
  }
}

async function migrateMeta() {
  console.log('\n=== Migrating Meta ===');
  
  const file = fs.readFileSync(path.join(SETTINGS_DIR, 'page_settings.md'), 'utf8');
  const { data } = matter(file);

  const bannerId = await uploadBanner(data.page_banner);

  const payload = {
    data: {
      company: data.company,
      street: data.street,
      postal: data.postal,
      city: data.city,
      phone: data.phone,
      email: data.email,
      press_email: data.press_email,
      facebook: data.facebook,
      twitter: data.twitter,
      instagram: data.instagram,
      page_banner: bannerId
    }
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
  
  const file = `${pageName.toLowerCase()}.de.md`;
  const filePath = path.join(PAGES_DIR, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠ File not found: ${file}`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContent);

  const payload = {
    data: {
      title: frontmatter.title,
      content: content.trim()
    }
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

