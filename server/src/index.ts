import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import { initDB } from './db';
import { userRouter } from './routes/users';
import { swipeRouter } from './routes/swipes';
import { matchRouter } from './routes/matches';
import { marketplaceRouter } from './routes/marketplace';

const app = express();
const port = process.env.PORT || 3001;

// Initialize database
initDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Vite default dev server
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'your-secret-key', // TODO: Move to env
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/users', userRouter);
app.use('/api/swipes', swipeRouter);
app.use('/api/matches', matchRouter);
app.use('/api/marketplace', marketplaceRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});