import pg from 'pg';
const memoryActivities = [];
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined }) : null;
export async function initDb() {
    if (!pool)
        return;
    await pool.query(`CREATE TABLE IF NOT EXISTS agent_activity (id BIGSERIAL PRIMARY KEY, agent TEXT NOT NULL, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
}
export async function addActivity(agent, message) {
    if (!pool) {
        const item = { id: Date.now(), agent, message, createdAt: new Date().toISOString() };
        memoryActivities.unshift(item);
        return item;
    }
    const result = await pool.query('INSERT INTO agent_activity (agent, message) VALUES ($1, $2) RETURNING id, agent, message, created_at', [agent, message]);
    const row = result.rows[0];
    return { id: Number(row.id), agent: row.agent, message: row.message, createdAt: row.created_at.toISOString() };
}
export async function listActivities() {
    if (!pool)
        return memoryActivities.slice(0, 20);
    const result = await pool.query('SELECT id, agent, message, created_at FROM agent_activity ORDER BY created_at DESC LIMIT 20');
    return result.rows.map((row) => ({ id: Number(row.id), agent: row.agent, message: row.message, createdAt: row.created_at.toISOString() }));
}
