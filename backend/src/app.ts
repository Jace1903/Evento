import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import healthRouter from './routes/health';
import eventsRouter from './routes/events';
import savedEventsRouter from './routes/savedEvents';
import { clerkAuth } from './middleware/requireAuth';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(clerkAuth);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/health', healthRouter);
app.use('/api/events', eventsRouter);
app.use('/api/saved-events', savedEventsRouter);

app.use(errorHandler);

export default app;
