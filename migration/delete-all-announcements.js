import axios from 'axios';

const STRAPI_URL = 'http://localhost:1337';

async function deleteAll() {
  const api = axios.create({ baseURL: STRAPI_URL });
  
  const { data } = await api.get('/api/geko-announcements?pagination[pageSize]=1000');
  console.log(`Found ${data.data.length} announcements to delete`);
  
  for (const item of data.data) {
    await api.delete(`/api/geko-announcements/${item.id}`);
    console.log(`✓ Deleted: ${item.id}`);
  }
  
  console.log('All deleted!');
}

deleteAll();

