import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const STRAPI_URL = 'http://localhost:1337';
const ASSETS_DIR = '../../../geko-verein/assets/img/supporters';

const api = axios.create({ baseURL: STRAPI_URL });

const supporters = [
  { image: 'BHC_Logo_mit_Schutzzone_RGB.png', link: 'https://www.bosch-stiftung.de/de', alt: 'Robert Bosch Stiftung' },
  { image: 'Allzeitorte_nurLogos_nebeneinander_Web.png', link: 'https://www.bosch-stiftung.de/de/projekt/allzeitorte', alt: 'Allzeitorte' },
  { image: 'Logoleiste_A4_quer.jpg', link: 'http://www.rollberg-quartier.de/', alt: 'Rollberg Quartier' },
  { image: 'QM_Flughafen_neu.jpeg', link: 'https://www.qm-flughafenstrasse.de/', alt: 'Quartiersmanagement Flughafenstraße' },
  { image: 'B_SEN_ASGIVA_PartIntMig_Integrationsfonds_3erlogo_DE_H_PW_4C.png', link: 'https://www.berlin.de/ba-neukoelln/politik-und-verwaltung/beauftragte/neukoellner-koordination-fuer-fluechtlingsfragen/artikel.1288259.php', alt: 'Berliner Senat für Integration und Migration' },
  { image: 'gemeinsam_gesundes_berlin.png', link: 'https://www.berlin.de/sen/gesundheit/themen/gesundheitsfoerderung-und-praevention/aktionsprogramm-gesundheit/', alt: 'Gemeinsam Gesundes Berlin' },
  { image: 'logo_bundesstiftung_fh_und_bmfsfj.jpg', link: 'https://www.fruehehilfen.de/grundlagen-und-fachthemen/grundlagen-der-fruehen-hilfen/bundesstiftung-fruehe-hilfen/', alt: 'Bundesstiftung Frühe Hilfen' }
];

async function uploadImage(imagePath, altText) {
  const fullPath = path.join(ASSETS_DIR, imagePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠ Image not found: ${imagePath}`);
    return null;
  }

  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(fullPath));
    formData.append('fileInfo', JSON.stringify({ alternativeText: altText }));

    const response = await axios.post(`${STRAPI_URL}/api/upload`, formData, {
      headers: formData.getHeaders()
    });

    console.log(`✓ Uploaded: ${imagePath}`);
    return response.data[0].id;
  } catch (error) {
    console.error(`✗ Failed: ${imagePath}`);
    return null;
  }
}

async function addSupportersToLanding() {
  console.log('\n=== Adding Supporters Block ===\n');

  // Upload all supporter images
  const supporterEntries = [];
  for (const supporter of supporters) {
    const imageId = await uploadImage(supporter.image, supporter.alt);
    if (imageId) {
      supporterEntries.push({
        title: supporter.alt,
        project_url: supporter.link,
        image: imageId
      });
    }
  }

  console.log(`\nCreated ${supporterEntries.length} supporter entries`);

  // Get German landing page with populated content
  const { data: existing } = await api.get('/api/geko-page-landing?locale=de&populate[content][populate]=*');
  const currentBlocks = (existing.data?.content || []).map(block => {
    const { id, ...rest } = block;
    return rest;
  });

  // Add supporters block at the end
  const supportersBlock = {
    __component: 'geko-page-blocks.supporters',
    background_color: 'white',
    supporters: supporterEntries
  };

  const updatedBlocks = [...currentBlocks, supportersBlock];

  const payload = {
    data: {
      content: updatedBlocks
    }
  };

  try {
    await api.put(`/api/geko-page-landing?locale=de`, payload);
    console.log('\n✓ Added supporters block to German landing page');
  } catch (error) {
    console.error('✗ Failed:', error.response?.data || error.message);
  }
}

addSupportersToLanding();

