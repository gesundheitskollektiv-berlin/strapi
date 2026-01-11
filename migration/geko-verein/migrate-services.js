import path from 'path';
import { fileURLToPath } from 'url';
import { createStrapiClient } from '../shared/api.js';
import { loadLocalizedEntries } from '../shared/file-helpers.js';
import { uploadImageFromSource } from '../shared/image-upload.js';
import { bool, sanitizeText, markdownToBlocks } from '../shared/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const GEKO_ROOT = '/home/andi/Repositories/coderat/geko/geko-verein';
const SERVICES_DIR = path.join(GEKO_ROOT, 'collections/_services');
const LOCALES = ['de', 'en', 'fr', 'ro', 'tr', 'ar'];

// Icon mapping based on service titles/slugs
const ICON_MAPPING = {
  'kindermedizinische-praxis': 'fa-hands-holding-child',
  'stadtteilpraxis': 'fa-stethoscope',
  'therapie': 'fa-comments',
  'sport-und-spiel-im-kiez': 'fa-heart-pulse',
  'beratung': 'fa-people-arrows',
  'nachbarschaftsprojekte': 'fa-people-group',
  'cafe': 'fa-mug-saucer',
  'mobile-gesundheitsberatung': 'fa-circle-info',
  'navigation': 'fa-satellite-dish'
};

const api = createStrapiClient(STRAPI_URL, STRAPI_TOKEN);

function buildPayload(data, slug) {
  const isExternal = bool(data.external_service || data.external_link_only, false);

  // Use icon mapping if available, otherwise fall back to frontmatter icon
  let iconName = ICON_MAPPING[slug] || null;
  if (!iconName && data.icon) {
    iconName = path.basename(data.icon);
  }
  if (!iconName && data.icon_name) {
    iconName = data.icon_name;
  }

  const payload = {
    title: data.title || 'Ohne Titel',
    icon_name: iconName,
    inhouse: bool(data.inhouse, true),
    external_link_only: isExternal,
    project_url: data.project_url || null,
    description: markdownToBlocks(data.blurb || data.description || ''),
    languages: sanitizeText(data.languages || ''),
    offer: markdownToBlocks(data.offer || ''),
    when: sanitizeText(data.when || ''),
    who: markdownToBlocks(data.who || ''),
    where_address: sanitizeText(data.where_address || ''),
  };

  // Always include slug from the filename, even for external services
  // This satisfies the required validation
  if (slug) {
    payload.slug = slug;
  }

  return payload;
}

async function createService(slug, localesData) {
  const baseLocale = localesData.de ? 'de' : Object.keys(localesData)[0];
  if (!baseLocale) {
    console.log(`⚠ No locales for ${slug}, skipping`);
    return null;
  }

  const baseData = localesData[baseLocale];
  const payload = buildPayload(baseData, slug);
  payload.locale = baseLocale;

  if (!bool(baseData.external_service || baseData.external_link_only, false)) {
    const imageId = await uploadImageFromSource({
      api,
      rootDir: GEKO_ROOT,
      relativePath: baseData.featured_image,
      folderName: 'Services',
      altText: baseData.featured_image_alt,
    });
    if (imageId) payload.image = imageId;
  }

  try {
    const response = await api.post('/api/geko-services', { data: payload });
    const baseEntry = response.data.data;
    const documentId = baseEntry.documentId;
    console.log(`✓ Created service ${slug} (${baseLocale}) -> ${baseEntry.id}`);

    for (const locale of LOCALES) {
      if (locale === baseLocale) continue;
      if (!localesData[locale]) continue;

      const localizedPayload = buildPayload(localesData[locale], slug);

      try {
        await api.put(`/api/geko-services/${documentId}?locale=${locale}`, { data: localizedPayload });
        console.log(`  ↳ Added ${locale}`);
      } catch (error) {
        console.error(`  ✗ Failed ${locale}:`, error.response?.data || error.message);
      }
    }

    // Return documentId for landing page population
    return documentId;
  } catch (error) {
    console.error(`✗ Failed to create service ${slug}:`, error.response?.data || error.message);
    return null;
  }
}

// Recursively clean objects by removing id, documentId, and __temp_key__ fields
function cleanObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item));
  } else if (obj !== null && typeof obj === 'object') {
    const { id, documentId, __temp_key__, createdAt, updatedAt, publishedAt, locale, localizations, ...rest } = obj;
    const cleaned = {};
    for (const [key, value] of Object.entries(rest)) {
      cleaned[key] = cleanObject(value);
    }
    return cleaned;
  }
  return obj;
}

async function addServicesToLandingPage(serviceDocumentIds) {
  console.log('\n=== Adding Services to Landing Page ===\n');

  for (const locale of LOCALES) {
    console.log(`Processing locale: ${locale}`);

    try {
      // Fetch all services for this locale to get their documentIds
      const servicesResponse = await api.get(`/api/geko-services?locale=${locale}&pagination[limit]=100`);
      const servicesForLocale = servicesResponse.data.data;
      const totalServices = servicesResponse.data.meta?.pagination?.total || servicesForLocale?.length || 0;
      
      if (!servicesForLocale || servicesForLocale.length === 0) {
        console.log(`  ⚠ No services found for ${locale}, skipping`);
        continue;
      }

      // Get service documentIds for this locale (for relations, use documentId not id)
      const serviceDocIds = servicesForLocale.map(s => s.documentId);
      console.log(`  Found ${serviceDocIds.length} services for ${locale} (total in DB: ${totalServices})`);

      // Fetch the landing page for this locale
      const response = await api.get(`/api/geko-page-landing?locale=${locale}&populate=deep`);
      const landingPage = response.data.data;

      if (!landingPage) {
        console.log(`  ⚠ Landing page not found for ${locale}, skipping`);
        continue;
      }

      const documentId = landingPage.documentId;
      let content = landingPage.content || [];

      // Clean content: recursively remove id, documentId, and metadata fields
      content = cleanObject(content);

      // Ensure all blocks have required fields with defaults
      content = content.map(block => {
        // Apply navbar_link default to all blocks (it's a common field)
        if (block.__component && block.__component.startsWith('geko-page-blocks.')) {
          return {
            ...block,
            navbar_link: block.navbar_link ?? false
          };
        }
        return block;
      });

      // Find existing Services block
      let servicesBlockIndex = content.findIndex(
        block => block.__component === 'geko-page-blocks.services'
      );

      if (servicesBlockIndex === -1) {
        // Create new Services block
        const servicesBlock = {
          __component: 'geko-page-blocks.services',
          title: locale === 'de' ? 'Unsere Angebote' : 'Our Services',
          navbar_link: false,
          background_color: 'white',
          geko_services: serviceDocIds
        };
        content.push(servicesBlock);
        console.log(`  ✓ Created new Services block with ${serviceDocIds.length} services`);
      } else {
        // Update existing Services block
        content[servicesBlockIndex].geko_services = serviceDocIds;
        console.log(`  ✓ Updated Services block with ${serviceDocIds.length} services`);
      }

      // Update the landing page
      await api.put(`/api/geko-page-landing?locale=${locale}`, {
        data: { content }
      });
      console.log(`  ✓ Updated landing page for ${locale}`);
    } catch (error) {
      const errorDetails = error.response?.data?.error?.details?.errors || error.response?.data || error.message;
      console.error(`  ✗ Failed to update landing page for ${locale}:`, JSON.stringify(errorDetails, null, 2));
    }
  }

  console.log('\n✓ Landing page population complete!');
}

async function deleteAllServices() {
  console.log('\n===Cleaning up existing services ===\n');
  
  try {
    // Collect unique documentIds from ALL locales with proper pagination
    const documentIdsSet = new Set();
    
    for (const locale of LOCALES) {
      let currentPage = 1;
      let totalPages = 1;
      
      console.log(`  Scanning locale ${locale}...`);
      
      do {
        const response = await api.get(`/api/geko-services?locale=${locale}&pagination[page]=${currentPage}&pagination[pageSize]=100`);
        const services = response.data.data || [];
        
        services.forEach(s => {
          if (s.documentId) {
            documentIdsSet.add(s.documentId);
          }
        });
        
        const pagination = response.data.meta?.pagination;
        totalPages = pagination?.pageCount || 1;
        currentPage++;
      } while (currentPage <= totalPages);
    }
    
    const uniqueDocumentIds = Array.from(documentIdsSet);
    console.log(`\nFound ${uniqueDocumentIds.length} unique services across all locales\n`);
    
    let deleted = 0;
    for (const documentId of uniqueDocumentIds) {
      try {
        await api.delete(`/api/geko-services/${documentId}`);
        deleted++;
        if (deleted % 50 === 0) {
          console.log(`  ... deleted ${deleted}/${uniqueDocumentIds.length}`);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error(`  ✗ Failed to delete ${documentId}:`, error.response?.data?.error?.message || error.message);
        }
      }
    }
    
    console.log(`\n✓ Deleted ${deleted} unique services\n`);
    
    // Verify deletion per locale
    console.log('Verifying deletion per locale...');
    for (const locale of LOCALES) {
      const verifyResponse = await api.get(`/api/geko-services?locale=${locale}&pagination[limit]=1`);
      const remaining = verifyResponse.data.meta?.pagination?.total || 0;
      console.log(`  ${locale}: ${remaining} services remaining`);
    }
    console.log('');
  } catch (error) {
    console.error('✗ Failed during cleanup:', error.response?.data || error.message);
  }
}

async function migrateServices() {
  console.log('\n=== Migrating Services ===\n');
  
  // Step 0: Delete all existing services
  await deleteAllServices();
  
  const services = loadLocalizedEntries(SERVICES_DIR, LOCALES);
  const slugs = Object.keys(services);
  console.log(`Found ${slugs.length} service groups\n`);

  // Step 1: Create services in collection
  const serviceDocumentIds = [];
  for (const slug of slugs) {
    console.log(`Processing ${slug}`);
    const documentId = await createService(slug, services[slug]);
    if (documentId) {
      serviceDocumentIds.push(documentId);
    }
  }

  console.log('\n✓ Service collection migration complete!');

  // Step 2: Add services to landing page Services block
  await addServicesToLandingPage(serviceDocumentIds);

  console.log('\n✓ All service migration complete!');
}

migrateServices();






