import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Get matches for a user
router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await db.read();
  const userMatches = db.data.matches.filter(m => 
    m.user1_id === req.session.userId || m.user2_id === req.session.userId
  );

  // Populate match objects with user details
  const populatedMatches = userMatches.map(match => {
    const otherUserId = match.user1_id === req.session.userId ? match.user2_id : match.user1_id;
    const otherUser = db.data.users.find(u => u.id === otherUserId);
    if (!otherUser) return null;

    const { password: _, ...userWithoutPassword } = otherUser;
    return {
      id: match.id,
      user: userWithoutPassword,
      lastMessage: match.lastMessage,
      timestamp: match.timestamp,
      unread: match.unread,
      chatHistory: match.chatHistory || []
    };
  }).filter(Boolean);

  res.json(populatedMatches);
});

// Send a message
router.post('/:matchId/messages', async (req, res) => {
  const { matchId } = req.params;
  const { text } = req.body;
  
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await db.read();
  const matchIndex = db.data.matches.findIndex(m => m.id === parseInt(matchId));
  if (matchIndex === -1) {
    return res.status(404).json({ message: 'Match not found' });
  }

  const match = db.data.matches[matchIndex];
  if (match.user1_id !== req.session.userId && match.user2_id !== req.session.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const newMessage = {
    id: Date.now(),
    senderId: req.session.userId,
    text,
    timestamp: new Date().toISOString()
  };

  if (!match.chatHistory) match.chatHistory = [];
  match.chatHistory.push(newMessage);
  match.lastMessage = text;
  match.timestamp = newMessage.timestamp;
  match.unread = true;

  await db.write();
  res.status(201).json(newMessage);
});

// Mark messages as read
router.patch('/:matchId/read', async (req, res) => {
  const { matchId } = req.params;
  
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await db.read();
  const matchIndex = db.data.matches.findIndex(m => m.id === parseInt(matchId));
  if (matchIndex === -1) {
    return res.status(404).json({ message: 'Match not found' });
  }

  const match = db.data.matches[matchIndex];
  if (match.user1_id !== req.session.userId && match.user2_id !== req.session.userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  match.unread = false;
  await db.write();
  res.json({ message: 'Messages marked as read' });
});

export const matchRouter = router;