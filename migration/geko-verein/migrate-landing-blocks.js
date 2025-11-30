import path from 'path';
import { createStrapiClient } from '../shared/api.js';
import { readMarkdownFile } from '../shared/file-helpers.js';
import { sanitizeText } from '../shared/utils.js';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const GEKO_ROOT = path.resolve('../../../../geko-verein');
const BLOCKS_DIR = path.join(GEKO_ROOT, 'collections/_blocks');
const LOCALES = ['de', 'en', 'fr', 'ar', 'ro', 'tr'];

const api = createStrapiClient(STRAPI_URL, STRAPI_TOKEN);

const blockMapping = {
  welcome: 'geko-page-blocks.welcome',
  about: 'geko-page-blocks.about',
  calendar: 'geko-page-blocks.calendar',
  aktuelles: 'geko-page-blocks.news',
  contact: 'geko-page-blocks.contact',
  'was-finde-ich-hier': 'geko-page-blocks.services',
  'liebe-nachbar-innen-unterstützt-euer-gesundheitszentrum-in-neukölln': 'geko-page-blocks.neighbours',
};

const colorMapping = {
  yellow: 'yellow',
  red: 'red',
  blue: 'blue',
  green: 'green',
  white: 'white',
};

function parseBlock(filePath, componentType) {
  const file = readMarkdownFile(filePath);
  if (!file) return null;

  const cleanContent = sanitizeText(
    file.content
      .replace(/<button.*?>.*?<\/button>/gs, '')
  );

  const block = {
    __component: componentType,
    title: file.data.title || '',
    navbar_link: file.data['navbar-entry'] || false,
    navbar_link_title: file.data['navbar-entry-title'] || null,
    background_color: colorMapping[file.data['background-color']] || null,
  };

  if (cleanContent && !componentType.includes('news') && !componentType.includes('calendar')) {
    block.content = cleanContent;
  }

  block._position = file.data.position || 999;
  return block;
}

function buildBlocksForLocale(locale) {
  const blocks = [];

  for (const [fileName, componentType] of Object.entries(blockMapping)) {
    const filePath = path.join(BLOCKS_DIR, `${fileName}.${locale}.md`);
    const block = parseBlock(filePath, componentType);
    if (!block) {
      console.log(`  ⚠ File not found: ${fileName}.${locale}.md`);
      continue;
    }
    blocks.push(block);
  }

  return blocks
    .sort((a, b) => a._position - b._position)
    .map(({ _position, ...rest }) => rest);
}

async function migrateLandingForLocale(locale) {
  console.log(`Processing locale: ${locale}`);

  try {
    const { data } = await api.get('/api/geko-page-landing', {
      params: { locale },
    });

    if (!data?.data) {
      console.log(`  ⚠ No entry found for locale: ${locale}`);
      return;
    }

    const blocks = buildBlocksForLocale(locale);
    console.log(`  Found ${blocks.length} blocks`);

    await api.put('/api/geko-page-landing', {
      data: { content: blocks },
    }, {
      params: { locale },
    });

    console.log(`✓ Updated landing page (${locale})\n`);
  } catch (error) {
    console.error(`✗ Failed (${locale}):`, error.response?.data || error.message);
  }
}

async function migrateLandingPage() {
  console.log('\n=== Migrating Landing Page Blocks ===\n');

  for (const locale of LOCALES) {
    await migrateLandingForLocale(locale);
  }

  console.log('✓ Migration complete!');
}

migrateLandingPage();

