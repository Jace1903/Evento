import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query;

    const conditions: string[] = ['e.start_at >= NOW()'];
    const params: unknown[] = [];
    let idx = 1;

    if (category && category !== 'all') {
      conditions.push(`c.slug = $${idx++}`);
      params.push(category);
    }

    if (search && typeof search === 'string' && search.trim()) {
      conditions.push(
        `(e.title ILIKE $${idx} OR e.location_name ILIKE $${idx} OR e.location_address ILIKE $${idx})`
      );
      params.push(`%${search.trim()}%`);
      idx++;
    }

    const where = conditions.join(' AND ');
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const offset = (pageNum - 1) * limitNum;

    const [eventsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT
           e.id, e.title, e.description,
           e.start_at, e.end_at,
           e.location_name, e.location_address,
           e.is_free, e.price_min, e.price_max,
           e.attendee_count, e.source, e.source_url, e.image_url,
           c.name  AS category_name,
           c.slug  AS category_slug,
           c.emoji AS category_emoji,
           c.color AS category_color
         FROM events e
         LEFT JOIN categories c ON e.category_id = c.id
         WHERE ${where}
         ORDER BY e.start_at ASC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, limitNum, offset]
      ),
      pool.query(
        `SELECT COUNT(*) FROM events e
         LEFT JOIN categories c ON e.category_id = c.id
         WHERE ${where}`,
        params
      ),
    ]);

    const events = eventsResult.rows.map((e) => ({
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
      category: e.category_slug
        ? {
            name: e.category_name,
            slug: e.category_slug,
            emoji: e.category_emoji,
            color: e.category_color,
          }
        : null,
    }));

    res.json({
      events,
      total: parseInt(countResult.rows[0].count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         e.*, c.name AS category_name, c.slug AS category_slug,
         c.emoji AS category_emoji, c.color AS category_color
       FROM events e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

export default router;
