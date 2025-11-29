import axios from 'axios';

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const api = axios.create({
  baseURL: STRAPI_URL,
  headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : undefined,
});

async function deleteAllServices() {
  console.log('\n=== Deleting existing services ===\n');

  const { data } = await api.get('/api/geko-services?locale=all&pagination[pageSize]=1000');
  const entries = data.data || [];
  console.log(`Found ${entries.length} service entries`);

  for (const entry of entries) {
    await api.delete(`/api/geko-services/${entry.id}`);
    console.log(`✓ Deleted service ${entry.id}`);
  }

  console.log('\nDone removing services.\n');
}

deleteAllServices();

