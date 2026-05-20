import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/events — list events with optional filtering
router.get('/', async (req: Request, res: Response) => {
  const { category, search, page = '1', limit = '20' } = req.query;
  // TODO: query DB and/or aggregator services
  res.json({
    events: [],
    page: Number(page),
    limit: Number(limit),
    total: 0,
  });
});

// GET /api/events/:id
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: fetch from DB
  res.json({ id, message: 'Event detail placeholder' });
});

export default router;
