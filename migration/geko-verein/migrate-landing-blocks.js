import path from 'path';
import { fileURLToPath } from 'url';
import { createStrapiClient } from '../shared/api.js';
import { readMarkdownFile } from '../shared/file-helpers.js';
import { sanitizeText, markdownToBlocks } from '../shared/utils.js';
import { uploadImageFromSource } from '../shared/image-upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const GEKO_ROOT = '/home/andi/Repositories/coderat/geko/geko-verein';
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
  if (!file) {
    console.log(`  ⚠ Could not read file: ${filePath}`);
    return null;
  }

  const rawContent = file.content.replace(/<button.*?>.*?<\/button>/gs, '');
  
  // Components that need blocks format: welcome, about, neighbours, contact
  const needsBlocks = ['welcome', 'about', 'neighbours', 'contact'].some(name => 
    componentType.includes(name)
  );

  const block = {
    __component: componentType,
    title: file.data.title || '',
    navbar_link: file.data['navbar-entry'] || false,
    navbar_link_title: file.data['navbar-entry-title'] || null,
    background_color: colorMapping[file.data['background-color']] || null,
  };

  // Set content ONLY for blocks that have it: welcome, about, neighbours, contact
  // Services, news, and calendar don't have content fields
  if (needsBlocks && rawContent) {
    console.log(`  Processing ${componentType}: raw=${rawContent.length} chars`);
    const blocksContent = markdownToBlocks(rawContent);
    console.log(`  -> blocks result: ${blocksContent ? blocksContent.length : 'null'} blocks`);
    // Always set content - use blocks if available, otherwise empty paragraph
    if (blocksContent && blocksContent.length > 0) {
      block.content = blocksContent;
      console.log(`  -> Set content: ${blocksContent.length} blocks`);
    } else if (rawContent.trim()) {
      // If we have content but markdownToBlocks returned null, create a simple paragraph
      block.content = [{ type: 'paragraph', children: [{ type: 'text', text: rawContent.trim() }] }];
      console.log(`  -> Set fallback content: 1 paragraph with ${rawContent.trim().length} chars`);
    } else {
      console.log(`  -> NO CONTENT SET (raw was empty after trim)`);
    }
  }

  block._position = file.data.position || 999;
  return block;
}

async function buildSupportersData() {
  const supporters = [
    {
      title: 'Robert Bosch Stiftung',
      project_url: 'https://www.bosch-stiftung.de/de',
      image_path: './assets/img/supporters/BHC_Logo_mit_Schutzzone_RGB.png',
      width: 'half',
    },
    {
      title: 'Allzeitorte',
      project_url: 'https://www.bosch-stiftung.de/de/projekt/allzeitorte',
      image_path: './assets/img/supporters/Allzeitorte_nurLogos_nebeneinander_Web.png',
      width: 'half',
    },
    {
      title: 'Rollberg Quartier',
      project_url: 'http://www.rollberg-quartier.de/',
      image_path: './assets/img/supporters/Logoleiste_A4_quer.jpg',
      width: 'full',
    },
    {
      title: 'Quartiersmanagement Flughafenstraße',
      project_url: 'https://www.qm-flughafenstrasse.de/',
      image_path: './assets/img/supporters/QM_Flughafen_neu.jpeg',
      width: 'full',
    },
    {
      title: 'Berliner Senat für Integration und Migration',
      project_url: 'https://www.berlin.de/ba-neukoelln/politik-und-verwaltung/beauftragte/neukoellner-koordination-fuer-fluechtlingsfragen/artikel.1288259.php',
      image_path: './assets/img/supporters/B_SEN_ASGIVA_PartIntMig_Integrationsfonds_3erlogo_DE_H_PW_4C.png',
      width: 'full',
    },
    {
      title: 'Gemeinsam Gesundes Berlin',
      project_url: 'https://www.berlin.de/sen/gesundheit/themen/gesundheitsfoerderung-und-praevention/aktionsprogramm-gesundheit/',
      image_path: './assets/img/supporters/gemeinsam_gesundes_berlin.png',
      width: 'half',
    },
    {
      title: 'Bundesstiftung Frühe Hilfen',
      project_url: 'https://www.fruehehilfen.de/grundlagen-und-fachthemen/grundlagen-der-fruehen-hilfen/bundesstiftung-fruehe-hilfen/',
      image_path: './assets/img/supporters/logo_bundesstiftung_fh_und_bmfsfj.jpg',
      width: 'half',
    },
  ];

  const supportersData = [];
  
  for (const supporter of supporters) {
    console.log(`  Uploading supporter: ${supporter.title}`);
    const imageId = await uploadImageFromSource({
      api,
      rootDir: GEKO_ROOT,
      relativePath: supporter.image_path,
      folderName: 'Supporters',
      altText: supporter.title,
    });

    if (imageId) {
      supportersData.push({
        title: supporter.title,
        project_url: supporter.project_url,
        image: imageId,
        width: supporter.width,
      });
    }
  }

  return supportersData;
}

async function buildBlocksForLocale(locale) {
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

  // Add supporters block with actual supporters data (only on first locale to avoid duplicate uploads)
  const supportersData = locale === 'de' ? await buildSupportersData() : [];
  blocks.push({
    __component: 'geko-page-blocks.supporters',
    background_color: 'white',
    supporters: supportersData,
    _position: 998,
  });
  
  // Add footer block (no markdown source - static component)
  blocks.push({
    __component: 'geko-page-blocks.footer',
    background_color: 'white',
    _position: 999,
  });

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

    const blocks = await buildBlocksForLocale(locale);
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






