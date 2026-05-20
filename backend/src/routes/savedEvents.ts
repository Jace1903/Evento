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

// GET /api/saved-events — list full event objects saved by the current user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const { rows } = await pool.query(
    `SELECT
       e.id, e.title, e.description,
       e.start_at, e.end_at,
       e.location_name, e.location_address,
       e.is_free, e.price_min, e.price_max,
       e.attendee_count, e.source, e.source_url, e.image_url,
       c.name  AS category_name,
       c.slug  AS category_slug,
       c.emoji AS category_emoji,
       c.color AS category_color,
       se.created_at AS saved_at
     FROM saved_events se
     JOIN users u       ON se.user_id  = u.id
     JOIN events e      ON se.event_id = e.id
     LEFT JOIN categories c ON e.category_id = c.id
     WHERE u.clerk_id = $1
     ORDER BY se.created_at DESC`,
    [userId]
  );

  const events = rows.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    startAt: e.start_at,
    endAt: e.end_at,
    locationName: e.location_name,
    locationAddress: e.location_address,
    isFree: e.is_free,
    priceMin: e.price_min ? parseFloat(e.price_min) : null,
    priceMax: e.price_max ? parseFloat(e.price_max) : null,
    attendeeCount: e.attendee_count,
    source: e.source,
    sourceUrl: e.source_url,
    imageUrl: e.image_url,
    savedAt: e.saved_at,
    category: e.category_slug
      ? { name: e.category_name, slug: e.category_slug, emoji: e.category_emoji, color: e.category_color }
      : null,
  }));

  res.json({ events });
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
