import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), '..', '.tmp', 'data.db');

async function fixCreatedAt() {
  const db = new Database(DB_PATH);
  
  // Update created_at from publish_date for announcements
  const result = db.prepare(`
    UPDATE geko_announcements 
    SET created_at = publish_date 
    WHERE publish_date IS NOT NULL
  `).run();
  
  console.log(`✓ Updated ${result.changes} announcements with publish_date as created_at`);
  
  db.close();
}

fixCreatedAt();

