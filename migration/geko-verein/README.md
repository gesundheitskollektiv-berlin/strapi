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

## Shared Helpers

Common logic (Strapi client, file loading, image uploads, helpers) lives in `../shared/` and is imported by each migration script. Add new helpers there when extending migrations.

## Image Handling

Each migration uploads assets into its own Media Library folder (`Announcements`, `Services`, `Pages`, etc.). Folders are created automatically if missing, and uploads are cached to avoid duplicates.

## Technical Notes

- All scripts use REST API via axios (not Document Service API)
- Document Service API approach didn't work due to Node.js ESM + Strapi v5 compatibility issues
- Shared upload helper prevents duplicate uploads and enforces folder placement
- Missing images are logged but don't stop migration
- Path references: `../../../../geko-verein/` (relative to script location)

