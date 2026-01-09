import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function loadAllMarkdown(dir) {
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.md'));
  return files.map((file) => {
    const filepath = path.join(dir, file);
    const raw = fs.readFileSync(filepath, 'utf8');
    const { data, content } = matter(raw);
    return {
      file,
      slug: file.replace(/\.md$/, ''),
      data,
      content: content.trim(),
    };
  });
}

export function loadLocalizedEntries(dir, locales) {
  const entries = {};
  const files = fs.readdirSync(dir).filter((file) => file.endsWith('.md'));

  for (const file of files) {
    const match = file.match(/^(.*)\.([a-z]{2})\.md$/);
    if (!match) continue;

    const [, slug, locale] = match;
    if (!locales.includes(locale)) continue;

    const filepath = path.join(dir, file);
    const raw = fs.readFileSync(filepath, 'utf8');
    const { data } = matter(raw);

    if (!entries[slug]) entries[slug] = {};
    entries[slug][locale] = data;
  }

  return entries;
}

export function readMarkdownFile(filepath) {
  if (!fs.existsSync(filepath)) {
    return null;
  }

  const raw = fs.readFileSync(filepath, 'utf8');
  const { data, content } = matter(raw);
  return { data, content: content.trim() };
}






