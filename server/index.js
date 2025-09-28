import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { db, migrate, seedIfEmpty, getUserWithDetails, nextId } from './db.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

await migrate();
await seedIfEmpty();

// Helpers
function toUser(row) { return row ? getUserWithDetails(row.id) : null; }

// Auth-lite (demo): login by userId
app.post('/api/login', async (req,res) => {
  const { userId } = req.body;
  await db.read();
  const user = getUserWithDetails(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Feed: users the current user hasn't swiped yet
app.get('/api/feed/:userId', async (req,res) => {
  const userId = Number(req.params.userId);
  await db.read();
  const swiped = db.data.swipes.filter(s => s.swiper_id === userId).map(s => s.swiped_id);
  const ids = new Set([userId, ...swiped]);
  const result = db.data.users.map(u => u.id).filter(id => !ids.has(id)).map(id => getUserWithDetails(id));
  res.json(result);
});

// Swipe
app.post('/api/swipes', async (req,res) => {
  const { swiperId, swipedId, direction } = req.body;
  const ts = new Date().toISOString();
  await db.read();
  db.data.swipes.push({ id: nextId(db.data.swipes), swiper_id: swiperId, swiped_id: swipedId, direction, ts });
  // If reciprocal right swipe, create match
  if (direction === 'right') {
    const reciprocal = db.data.swipes.find(s => s.swiper_id === swipedId && s.swiped_id === swiperId && s.direction === 'right');
    if (reciprocal) {
      const a = Math.min(swiperId, swipedId);
      const b = Math.max(swiperId, swipedId);
      const exists = db.data.matches.find(m => Math.min(m.user1_id,m.user2_id) === a && Math.max(m.user1_id,m.user2_id) === b);
      if (!exists) db.data.matches.push({ id: nextId(db.data.matches), user1_id: a, user2_id: b, matched_at: ts });
    }
  }
  await db.write();
  res.json({ ok: true });
});

// Matches
app.get('/api/matches/:userId', async (req,res) => {
  const userId = Number(req.params.userId);
  await db.read();
  const rows = db.data.matches.filter(m => m.user1_id === userId || m.user2_id === userId).sort((a,b) => (a.matched_at < b.matched_at ? 1 : -1));
  const results = rows.map(m => {
    const otherId = m.user1_id === userId ? m.user2_id : m.user1_id;
    const user = getUserWithDetails(otherId);
    const msgs = db.data.messages.filter(r => r.match_id === m.id).sort((a,b) => a.id - b.id);
    const last = msgs[msgs.length-1];
    return {
      id: m.id,
      user,
      lastMessage: last ? last.text : '',
      timestamp: last ? last.timestamp : m.matched_at,
      unread: false,
      chatHistory: msgs.map(r => ({ id: r.id, senderId: r.sender_id, text: r.text, timestamp: r.timestamp }))
    };
  });
  res.json(results);
});

// Messages
app.post('/api/messages', async (req,res) => {
  const { matchId, senderId, text } = req.body;
  const ts = new Date().toISOString();
  await db.read();
  const id = nextId(db.data.messages);
  db.data.messages.push({ id, match_id: matchId, sender_id: senderId, text, timestamp: ts });
  await db.write();
  res.json({ id, matchId, senderId, text, timestamp: ts });
});

// Date ideas
app.get('/api/date-ideas', async (req,res) => {
  await db.read();
  const rows = [...db.data.date_ideas].sort((a,b) => b.id - a.id);
  const result = rows.map(r => ({
    id: r.id,
    creator: getUserWithDetails(r.creator_id),
    title: r.title,
    description: r.description,
    location: r.location,
    applicants: db.data.date_idea_applicants.filter(a => a.date_idea_id === r.id).map(a => getUserWithDetails(a.user_id))
  }));
  res.json(result);
});

app.post('/api/date-ideas', async (req,res) => {
  const { creatorId, title, description, location } = req.body;
  const ts = new Date().toISOString();
  await db.read();
  const id = nextId(db.data.date_ideas);
  db.data.date_ideas.push({ id, creator_id: creatorId, title, description, location, created_at: ts });
  await db.write();
  res.json({ id });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
