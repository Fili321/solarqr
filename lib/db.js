import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize table on first use
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
    initialized = true;
  }
  return pool;
}

export async function getAllVideos() {
  const db = await getDB();
  const { rows } = await db.query(
    'SELECT * FROM videos ORDER BY created_at DESC'
  );
  return rows;
}

export async function getVideoById(id) {
  const db = await getDB();
  const { rows } = await db.query('SELECT * FROM videos WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function createVideo({ title, description, r2Key }) {
  const db = await getDB();
  const { rows } = await db.query(
    `INSERT INTO videos (title, description, r2_key)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, description, r2Key]
  );
  return rows[0];
}

export async function updateVideo(id, { title, description, r2Key }) {
  const db = await getDB();
  const { rows } = await db.query(
    `UPDATE videos
     SET title       = COALESCE($2, title),
         description = COALESCE($3, description),
         r2_key      = COALESCE($4, r2_key),
         updated_at  = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, title, description, r2Key]
  );
  return rows[0] || null;
}

export async function deleteVideo(id) {
  const db = await getDB();
  await db.query('DELETE FROM videos WHERE id = $1', [id]);
}
