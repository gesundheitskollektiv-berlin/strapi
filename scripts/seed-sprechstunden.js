'use strict';

/**
 * Seeds Sprechstunden data into alpra-page-landing.
 * Prerequisites: Strapi must be running (npm run develop).
 * Auth: Set STRAPI_TOKEN for create/update (admin token from Strapi dashboard).
 *
 * Usage: npm run seed:sprechstunden
 *   or:  STRAPI_TOKEN=xxx node scripts/seed-sprechstunden.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const LOCALE = process.env.LOCALE || 'de';

if (!STRAPI_TOKEN) {
  console.warn('Warning: STRAPI_TOKEN not set. Create/update may fail if APIs require auth.');
}

// Schedule data: type -> day -> slot desc -> { time, doctors }
const AKUT_SCHEDULE = {
  Montag: {
    Vormittag: { time: '9-10', doctors: ['Schubert', 'Barra', 'Henatsch'] },
    Nachmittag: null,
  },
  Dienstag: {
    Vormittag: { time: '9-10', doctors: ['Rickers', 'Osman'] },
    Nachmittag: { time: '15-16', doctors: ['Henatsch', 'Barra'] },
  },
  Mittwoch: {
    Vormittag: { time: '9-10', doctors: ['Rickers', 'Henatsch'] },
    Nachmittag: { time: '15-16', doctors: ['Rickers', 'Osman', 'Barra'] },
  },
  Donnerstag: {
    Vormittag: { time: '9-10', doctors: ['Schubert', 'Osman'] },
    Nachmittag: { time: '15-16', doctors: ['Schubert', 'Osman'] },
  },
  Freitag: {
    Vormittag: { time: '9-10', doctors: ['Schubert', 'Rickers'] },
    Nachmittag: null,
  },
};

const TERMIN_SCHEDULE = {
  Montag: {
    Vormittag: { time: '10:15-12', doctors: ['Schubert', 'Henatsch', 'Barra'] },
    Nachmittag: null,
  },
  Dienstag: {
    Vormittag: { time: '10:15-12', doctors: ['Rickers', 'Osman'] },
    Nachmittag: { time: '16:15-18', doctors: ['Henatsch', 'Barra'] },
  },
  Mittwoch: {
    Vormittag: { time: '10:15-12', doctors: ['Rickers', 'Henatsch'] },
    Nachmittag: { time: '16:15-18', doctors: ['Rickers', 'Osman', 'Barra'] },
  },
  Donnerstag: {
    Vormittag: { time: '10:15-12', doctors: ['Schubert', 'Osman'] },
    Nachmittag: { time: '16:15-17', doctors: ['Henatsch', 'Schubert', 'Osman'] },
  },
  Freitag: {
    Vormittag: { time: '10:15-12', doctors: ['Schubert', 'Rickers'] },
    Nachmittag: null,
  },
};

const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

function parseTime(timeStr) {
  if (!timeStr || timeStr === '-') return null;
  const [start, end] = timeStr.split('-').map((s) => s.trim());
  return { start, end };
}

function buildSprechzeiten(dayData, doctorIds) {
  const slots = [];
  for (const [desc, data] of [['Vormittag', dayData.Vormittag], ['Nachmittag', dayData.Nachmittag]]) {
    if (!data) continue;
    const parsed = parseTime(data.time);
    if (!parsed) continue;
    const docIds = (data.doctors || []).map((n) => doctorIds[n]).filter(Boolean);
    slots.push({
      description: desc,
      start: parsed.start,
      end: parsed.end,
      doctors: docIds,
    });
  }
  return slots;
}

function scheduleToSprechstundenart(type, schedule, doctorIds) {
  return {
    type,
    days: DAYS.map((day) => ({
      day,
      sprechzeiten: buildSprechzeiten(schedule[day], doctorIds),
    })).filter((d) => d.sprechzeiten.length > 0),
  };
}

async function apiFetch(endpoint, options = {}) {
  const url = `${STRAPI_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status} ${endpoint}: ${body}`);
  }
  return res.json();
}

async function ensurePersonnel() {
  const lastNames = ['Schubert', 'Barra', 'Henatsch', 'Rickers', 'Osman'];
  const doctorIds = {};

  for (const lastName of lastNames) {
    const res = await apiFetch(
      `/api/alpra-personnels?filters[last_name][$eq]=${encodeURIComponent(lastName)}&status=published`
    );
    let doc = (res.data || [])[0];
    if (!doc) {
      const draftRes = await apiFetch(
        `/api/alpra-personnels?filters[last_name][$eq]=${encodeURIComponent(lastName)}&status=draft`
      );
      doc = (draftRes.data || [])[0];
    }
    if (doc) {
      doctorIds[lastName] = doc.documentId;
      console.log(`  Found personnel: ${lastName} (${doc.documentId})`);
    } else {
      const createRes = await apiFetch('/api/alpra-personnels?status=published', {
        method: 'POST',
        body: JSON.stringify({
          data: { first_name: '', last_name: lastName },
        }),
      });
      const created = createRes.data;
      doctorIds[lastName] = created.documentId;
      console.log(`  Created personnel: ${lastName} (${created.documentId})`);
    }
  }
  return doctorIds;
}

// Recursively remove id, __temp_key__ from components (Strapi rejects component ids on update).
// Keep documentId for relation values - convert populated relations to documentId arrays.
function cleanObject(obj, isRelationValue = false) {
  if (Array.isArray(obj)) {
    const first = obj[0];
    // If array of objects with documentId, likely a relation - extract documentIds
    if (typeof first === 'object' && first !== null && 'documentId' in first) {
      return obj.map((item) => item.documentId || item.id).filter(Boolean);
    }
    return obj.map((item) => cleanObject(item, false));
  }
  if (obj !== null && typeof obj === 'object') {
    const { id, __temp_key__, createdAt, updatedAt, publishedAt, locale, localizations, ...rest } = obj;
    const cleaned = {};
    for (const [key, value] of Object.entries(rest)) {
      cleaned[key] = cleanObject(value, false);
    }
    return cleaned;
  }
  return obj;
}

async function seed() {
  console.log('Ensuring personnel exist...');
  const doctorIds = await ensurePersonnel();

  const sprechstunden = [
    scheduleToSprechstundenart('Akutsprechstunde (ohne Termin)', AKUT_SCHEDULE, doctorIds),
    scheduleToSprechstundenart('Terminsprechstunde', TERMIN_SCHEDULE, doctorIds),
  ];

  console.log('\nFetching alpra-page-landing...');
  const landingRes = await apiFetch(
    `/api/alpra-page-landing?locale=${LOCALE}&populate[content][on][alpra-page-blocks.sprechstunden][populate]=*`
  );
  const landing = landingRes.data;

  if (!landing) {
    throw new Error('alpra-page-landing not found');
  }

  let content = Array.isArray(landing.content) ? [...landing.content] : [];
  const idx = content.findIndex((b) => b && b.__component === 'alpra-page-blocks.sprechstunden');

  const newBlock = {
    __component: 'alpra-page-blocks.sprechstunden',
    ...(content[idx] ? cleanObject(content[idx]) : {}),
    sprechstunden,
  };

  if (idx >= 0) {
    content[idx] = newBlock;
    console.log('Replaced existing Sprechstunden block.');
  } else {
    content.push(newBlock);
    console.log('Added new Sprechstunden block.');
  }

  // Recursively strip component ids from all blocks (Strapi rejects these on update)
  content = cleanObject(content);

  await apiFetch(`/api/alpra-page-landing?locale=${LOCALE}`, {
    method: 'PUT',
    body: JSON.stringify({ data: { content } }),
  });

  console.log('\nSprechstunden seeded successfully.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
