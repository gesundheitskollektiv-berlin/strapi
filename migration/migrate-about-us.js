import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import axios from 'axios';
import { marked } from 'marked';

const STRAPI_URL = 'http://localhost:1337';
const PAGES_DIR = '../../../geko-verein/collections/_pages';

const api = axios.create({ baseURL: STRAPI_URL });

function markdownToBlocks(markdown) {
  const tokens = marked.lexer(markdown);
  const blocks = [];

  tokens.forEach(token => {
    if (token.type === 'paragraph') {
      blocks.push({
        type: 'paragraph',
        children: [{ type: 'text', text: token.text }]
      });
    } else if (token.type === 'heading') {
      blocks.push({
        type: 'heading',
        level: token.depth,
        children: [{ type: 'text', text: token.text }]
      });
    } else if (token.type === 'list') {
      const format = token.ordered ? 'ordered' : 'unordered';
      blocks.push({
        type: 'list',
        format,
        children: token.items.map(item => ({
          type: 'list-item',
          children: [{ type: 'text', text: item.text }]
        }))
      });
    }
  });

  return blocks;
}

async function migrateAboutUs() {
  console.log('\n=== Migrating About Us with i18n ===');
  
  const locales = ['de', 'en', 'fr', 'ar', 'tr'];

  for (const locale of locales) {
    const file = `about_us.${locale}.md`;
    const filePath = path.join(PAGES_DIR, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠ File not found: ${file}`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);

    // Strip Jekyll includes
    const cleanContent = content
      .replace(/\{%.*?%\}/gs, '')
      .trim();

    const blocks = markdownToBlocks(cleanContent);

    // Get existing entry
    try {
      const { data: existing } = await api.get(`/api/geko-page-about?locale=${locale}`);
      
      if (!existing.data) {
        console.log(`⚠ No entry found for locale: ${locale}`);
        continue;
      }
      
      const payload = {
        data: {
          title: frontmatter.title,
          content: blocks
        }
      };

      await api.put(`/api/geko-page-about?locale=${locale}`, payload);
      console.log(`✓ About Us (${locale})`);
    } catch (error) {
      console.error(`✗ About Us (${locale}):`, error.response?.data?.error?.message || error.message);
    }
  }

  console.log('\n✓ Migration complete!');
}

migrateAboutUs();

