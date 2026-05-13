import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

let initialized = false;

export async function getDB() {
  if (!initialized) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        r2_key      VARCHAR(500) NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    const cols = [
      'instagram_url VARCHAR(500)',
      'facebook_url  VARCHAR(500)',
      'tiktok_url    VARCHAR(500)',
      'youtube_url   VARCHAR(500)',
      'whatsapp      VARCHAR(50)',
      'website_url   VARCHAR(500)',
      'phone         VARCHAR(50)',
    ];
    for (const col of cols) {
      await pool.query(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS ${col};`).catch(() => {});
    }
    initialized = true;
  }
  return pool;
}

export async function getAllVideos() {
  const db = await getDB();
  const { rows } = await db.query('SELECT * FROM videos ORDER BY created_at DESC');
  return rows;
}

export async function getVideoById(id) {
  const db = await getDB();
  const { rows } = await db.query('SELECT * FROM videos WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createVideo({ title, description, r2Key, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl, whatsapp, websiteUrl, phone }) {
  const db = await getDB();
  const { rows } = await db.query(
    `INSERT INTO videos (title, description, r2_key, instagram_url, facebook_url, tiktok_url, youtube_url, whatsapp, website_url, phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [title, description, r2Key, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl, whatsapp, websiteUrl, phone]
  );
  return rows[0];
}

export async function updateVideo(id, { title, description, r2Key, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl, whatsapp, websiteUrl, phone }) {
  const db = await getDB();
  const { rows } = await db.query(
    `UPDATE videos
     SET title         = COALESCE($2, title),
         description   = COALESCE($3, description),
         r2_key        = COALESCE($4, r2_key),
         instagram_url = $5,
         facebook_url  = $6,
         tiktok_url    = $7,
         youtube_url   = $8,
         whatsapp      = $9,
         website_url   = $10,
         phone         = $11,
         updated_at    = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, title, description, r2Key, instagramUrl, facebookUrl, tiktokUrl, youtubeUrl, whatsapp, websiteUrl, phone]
  );
  return rows[0] || null;
}

export async function deleteVideo(id) {
  const db = await getDB();
  await db.query('DELETE FROM videos WHERE id = $1', [id]);
}