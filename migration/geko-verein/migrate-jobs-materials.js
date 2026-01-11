import path from 'path';
import { fileURLToPath } from 'url';
import { createStrapiClient } from '../shared/api.js';
import { loadLocalizedEntries } from '../shared/file-helpers.js';
import { uploadImageFromSource } from '../shared/image-upload.js';
import { markdownToBlocks } from '../shared/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const GEKO_ROOT = '/home/andi/Repositories/coderat/geko/geko-verein';
const MATERIALS_DIR = path.join(GEKO_ROOT, 'collections/_materials');
const LOCALES = ['de', 'en', 'fr', 'ar', 'ro', 'tr'];

const api = createStrapiClient(STRAPI_URL, STRAPI_TOKEN);

// ============= MATERIALS MIGRATION =============

async function migrateMaterials() {
  console.log('\n=== Migrating Materials ===\n');
  
  const materials = loadLocalizedEntries(MATERIALS_DIR, LOCALES);
  const slugs = Object.keys(materials);
  console.log(`Found ${slugs.length} material groups\n`);

  for (const slug of slugs) {
    console.log(`Processing ${slug}`);
    await createMaterial(slug, materials[slug]);
  }

  console.log('\n✓ Materials migration complete!');
}

async function createMaterial(slug, localesData) {
  const baseLocale = localesData.de ? 'de' : Object.keys(localesData)[0];
  if (!baseLocale) {
    console.log(`  ⚠ No locales for ${slug}, skipping`);
    return;
  }

  const baseData = localesData[baseLocale];
  
  // Upload file for base locale
  let fileId = null;
  if (baseData.attachment) {
    fileId = await uploadImageFromSource({
      api,
      rootDir: GEKO_ROOT,
      relativePath: baseData.attachment,
      folderName: 'Materials',
      altText: baseData.title || 'Material',
    });
  }

  const payload = {
    title: baseData.title || 'Ohne Titel',
    description: baseData.description ? markdownToBlocks(baseData.description) : null,
    file: fileId,
    locale: baseLocale,
    publishedAt: new Date().toISOString(),
  };

  try {
    const response = await api.post('/api/geko-materials', { data: payload });
    const baseEntry = response.data.data;
    const documentId = baseEntry.documentId;
    console.log(`  ✓ Created material ${slug} (${baseLocale}) -> ${baseEntry.id}`);

    // Add other locales
    for (const locale of LOCALES) {
      if (locale === baseLocale) continue;
      if (!localesData[locale]) continue;

      const localeData = localesData[locale];
      
      // Upload file for this locale if different
      let localeFileId = fileId; // Reuse base file if no specific file
      if (localeData.attachment && localeData.attachment !== baseData.attachment) {
        localeFileId = await uploadImageFromSource({
          api,
          rootDir: GEKO_ROOT,
          relativePath: localeData.attachment,
          folderName: 'Materials',
          altText: localeData.title || 'Material',
        });
      }

      const localizedPayload = {
        title: localeData.title || baseData.title,
        description: localeData.description ? markdownToBlocks(localeData.description) : null,
        file: localeFileId,
      };

      try {
        await api.put(`/api/geko-materials/${documentId}`, 
          { data: localizedPayload }, 
          { params: { locale } }
        );
        console.log(`    ↳ Added ${locale}`);
      } catch (error) {
        console.error(`    ✗ Failed ${locale}:`, error.response?.data?.error?.message || error.message);
      }
    }
  } catch (error) {
    console.error(`  ✗ Failed to create material ${slug}:`, error.response?.data?.error?.message || error.message);
  }
}

// ============= JOBS MIGRATION =============

async function migrateJobs() {
  console.log('\n=== Creating Dummy Job Offers ===\n');

  const jobs = [
    {
      title: 'Medizinische Fachangestellte (m/w/d)',
      description: `Für unsere allgemeinmedizinische Praxis suchen wir ab sofort eine **Medizinische Fachangestellte (m/w/d)** in Voll- oder Teilzeit.

**Deine Aufgaben:**
* Patientenbetreuung und -verwaltung
* Unterstützung bei Untersuchungen und Behandlungen
* Terminvergabe und Telefondienst
* Labor- und Verwaltungsarbeiten

**Du bringst mit:**
* Abgeschlossene Ausbildung als MFA
* Freude am Umgang mit Menschen
* Teamfähigkeit und Flexibilität
* Deutschkenntnisse in Wort und Schrift

**Wir bieten:**
* Ein engagiertes, multiprofessionelles Team
* Faire Vergütung nach Tarif
* 30 Tage Urlaub
* Fortbildungsmöglichkeiten

Bewerbungen an: bewerbung@geko-berlin.de`
    },
    {
      title: 'Sozialarbeiter*in (m/w/d) für Beratung',
      description: `Zur Verstärkung unseres Beratungsteams suchen wir zum nächstmöglichen Zeitpunkt eine **Sozialarbeiter*in (m/w/d)** mit 30-35 Wochenstunden.

**Deine Aufgaben:**
* Sozialberatung für Familien und Einzelpersonen
* Unterstützung bei Behördenangelegenheiten
* Netzwerkarbeit im Kiez
* Projektarbeit und Gruppenangebote

**Du bringst mit:**
* Abgeschlossenes Studium Soziale Arbeit oder vergleichbar
* Erfahrung in der Beratungsarbeit
* Mehrsprachigkeit (Türkisch, Arabisch oder Französisch) wünschenswert
* Engagement für soziale Gerechtigkeit

**Wir bieten:**
* Vergütung in Anlehnung an TVöD
* Supervision und Teamreflexion
* Gestaltungsspielraum
* Kollegiale Arbeitsatmosphäre

Bewerbungen bis 31.01.2026 an: bewerbung@geko-berlin.de`
    },
    {
      title: 'Pflegefachkraft (m/w/d) für Community Health Nursing',
      description: `Für unser innovatives Community Health Nursing Projekt suchen wir eine **Pflegefachkraft (m/w/d)** mit 20-30 Wochenstunden.

**Deine Aufgaben:**
* Aufsuchende Gesundheitsberatung im Kiez
* Gesundheitsförderung und Prävention
* Koordination von Versorgungsangeboten
* Netzwerkarbeit mit Kooperationspartnern

**Du bringst mit:**
* Examen als Gesundheits- und Krankenpfleger*in
* Interesse an Community Health
* Selbstständige und strukturierte Arbeitsweise
* Interkulturelle Kompetenz

**Wir bieten:**
* Vergütung angelehnt an TVöD
* Fortbildungen im Bereich Community Health Nursing
* Flexible Arbeitszeitgestaltung
* Ein innovatives Arbeitsfeld

Bewerbungen an: bewerbung@geko-berlin.de`
    }
  ];

  for (const job of jobs) {
    try {
      const payload = {
        title: job.title,
        job_description: markdownToBlocks(job.description),
        publishedAt: new Date().toISOString(),
      };

      const response = await api.post('/api/geko-jobs', { data: payload });
      console.log(`  ✓ Created job: ${job.title}`);
    } catch (error) {
      console.error(`  ✗ Failed to create job "${job.title}":`, error.response?.data?.error?.message || error.message);
    }
  }

  console.log('\n✓ Jobs migration complete!');
}

// ============= MAIN =============

async function migrateAll() {
  await migrateMaterials();
  await migrateJobs();
  console.log('\n✓ All migrations complete!');
}

migrateAll();
