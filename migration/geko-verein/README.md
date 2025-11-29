# Geko Verein → Strapi Migration Scripts

Migration scripts to import Jekyll content from geko-verein into Strapi v5.

## Scripts

All scripts use **REST API** (axios) for reliable operation.

### 1. Announcements
```bash
STRAPI_TOKEN=<your-token> node migrate-announcements.js
```
- Migrates 62 announcements from Jekyll markdown
- Uploads `featured_image` and `kicker_image` to Strapi Media Library
- Creates entries in German locale only
- Sets `is_event` based on `event_date` presence

### 2. Services
```bash
STRAPI_TOKEN=<your-token> node migrate-services.js
```
- Migrates 9 services with all 6 locales (de, en, fr, ro, tr, ar)
- Uploads `featured_image` for each service
- Handles boolean fields: `inhouse`, `external_link_only`

### 3. Pages
```bash
node migrate-pages.js
```
- Migrates Meta single type (company info, banner)
- Migrates Impressum and Datenschutzerklärung pages
- No token required (uses public endpoints)

### 4. Landing Page Blocks
```bash
node migrate-landing-blocks.js
```
- Migrates landing page dynamic zone blocks
- Processes all 6 locales
- Parses blocks from Jekyll markdown with frontmatter

## Requirements

- Strapi must be running: `yarn develop`
- For announcements/services: Set `STRAPI_TOKEN` environment variable
- Token needs full access permissions

## Image Handling

**Note:** Due to Strapi v5 REST API limitations, images upload to `public/uploads/` (root folder), not subfolders. The `path` parameter is ignored by the upload API. To organize images:

1. Manually create folders in Strapi Media Library (Settings → Media Library)
2. Move images via UI, or
3. Accept flat structure (all references work correctly)

## Technical Notes

- All scripts use REST API via axios (not Document Service API)
- Document Service API approach didn't work due to Node.js ESM + Strapi v5 compatibility issues
- Image caching prevents duplicate uploads
- Missing images are logged but don't stop migration
- Path references: `../../../../geko-verein/` (relative to script location)

