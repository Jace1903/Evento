import { Router, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import pool from '../db';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Upsert the Clerk user into our users table on first interaction
async function ensureUser(clerkId: string, email: string, name: string | null) {
  await pool.query(
    `INSERT INTO users (clerk_id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()`,
    [clerkId, email, name ?? email]
  );
}

// GET /api/saved-events — list saved event IDs for the current user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { rows } = await pool.query(
    `SELECT e.id FROM saved_events se
     JOIN users u ON se.user_id = u.id
     JOIN events e ON se.event_id = e.id
     WHERE u.clerk_id = $1`,
    [userId]
  );
  res.json({ savedIds: rows.map((r) => r.id) });
});

// POST /api/saved-events — save or unsave an event (toggle)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { eventId, email, name } = req.body as { eventId: string; email: string; name?: string };

  if (!eventId || !email) {
    res.status(400).json({ error: 'eventId and email are required' });
    return;
  }

  await ensureUser(userId!, email, name ?? null);

  const { rows: userRows } = await pool.query(
    'SELECT id FROM users WHERE clerk_id = $1',
    [userId]
  );
  const dbUserId = userRows[0]?.id;

  // Check if already saved
  const { rows: existing } = await pool.query(
    'SELECT id FROM saved_events WHERE user_id = $1 AND event_id = $2',
    [dbUserId, eventId]
  );

  if (existing.length > 0) {
    await pool.query('DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2', [dbUserId, eventId]);
    res.json({ saved: false });
  } else {
    await pool.query('INSERT INTO saved_events (user_id, event_id) VALUES ($1, $2)', [dbUserId, eventId]);
    res.json({ saved: true });
  }
});

export default router;
