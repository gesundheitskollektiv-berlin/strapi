import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';

const STRAPI_URL = 'http://localhost:1337';
const BLOCKS_DIR = '../../../../geko-verein/collections/_blocks';

const api = axios.create({ baseURL: STRAPI_URL });

const blockMapping = {
  'welcome': 'geko-page-blocks.welcome',
  'about': 'geko-page-blocks.about',
  'calendar': 'geko-page-blocks.calendar',
  'aktuelles': 'geko-page-blocks.news',
  'contact': 'geko-page-blocks.contact',
  'was-finde-ich-hier': 'geko-page-blocks.services',
  'liebe-nachbar-innen-unterstützt-euer-gesundheitszentrum-in-neukölln': 'geko-page-blocks.neighbours'
};

const colorMapping = {
  'yellow': 'yellow',
  'red': 'red',
  'blue': 'blue',
  'green': 'green',
  'white': 'white'
};

function parseBlocks(locale) {
  const blocks = [];
  
  for (const [fileName, componentType] of Object.entries(blockMapping)) {
    const file = `${fileName}.${locale}.md`;
    const filePath = path.join(BLOCKS_DIR, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ File not found: ${file}`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);

    const cleanContent = content
      .replace(/\{%.*?%\}/gs, '')
      .replace(/<button.*?>.*?<\/button>/gs, '')
      .trim();

    const block = {
      __component: componentType,
      title: frontmatter.title || '',
      navbar_link: frontmatter['navbar-entry'] || false,
      navbar_link_title: frontmatter['navbar-entry-title'] || null,
      background_color: colorMapping[frontmatter['background-color']] || null
    };
    
    // Add content only for components that have it (not news/calendar)
    if (cleanContent && !componentType.includes('news') && !componentType.includes('calendar')) {
      block.content = cleanContent;
    }

    // Add position for sorting
    const position = frontmatter.position || 999;
    blocks.push({ ...block, _position: position });
  }

  // Sort by position and remove _position
  return blocks
    .sort((a, b) => a._position - b._position)
    .map(({ _position, ...block }) => block);
}

async function migrateLandingPage() {
  console.log('\n=== Migrating Landing Page Blocks ===\n');
  
  const locales = ['de', 'en', 'fr', 'ar', 'ro', 'tr'];

  for (const locale of locales) {
    console.log(`Processing locale: ${locale}`);
    
    try {
      // Get current content for locale
      const { data: existing } = await api.get(`/api/geko-page-landing?locale=${locale}`);
      
      if (!existing.data) {
        console.log(`⚠ No entry found for locale: ${locale}\n`);
        continue;
      }
      
      const blocks = parseBlocks(locale);
      console.log(`  Found ${blocks.length} blocks`);

      const payload = {
        data: {
          content: blocks
        }
      };

      await api.put(`/api/geko-page-landing?locale=${locale}`, payload);
      console.log(`✓ Updated landing page (${locale})\n`);
    } catch (error) {
      console.error(`✗ Failed (${locale}):`, error.response?.data || error.message);
      console.log('');
    }
  }

  console.log('✓ Migration complete!');
}

migrateLandingPage();

