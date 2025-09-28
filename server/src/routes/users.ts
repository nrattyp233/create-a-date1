import { Router } from 'express';
import { db } from '../db';
import bcrypt from 'bcryptjs';

const router = Router();

// Get all users (for swipe feed)
router.get('/', async (req, res) => {
  await db.read();
  res.json(db.data.users);
});

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, name, age, bio, interests } = req.body;
  
  await db.read();
  const existingUser = db.data.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: db.data.users.length + 1,
    email,
    password: hashedPassword,
    name,
    age,
    bio,
    interests,
    photos: ['https://picsum.photos/id/1005/800/1200'], // Default avatar
    vibe: 'New User'
  };

  db.data.users.push(newUser);
  await db.write();

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  await db.read();
  const user = db.data.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { password: _, ...userWithoutPassword } = user;
  req.session.userId = user.id;
  res.json(userWithoutPassword);
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Update user profile
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (req.session.userId !== parseInt(id)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  await db.read();
  const userIndex = db.data.users.findIndex(u => u.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Don't allow password updates through this endpoint
  const { password, ...allowedUpdates } = updates;
  
  db.data.users[userIndex] = {
    ...db.data.users[userIndex],
    ...allowedUpdates
  };

  await db.write();
  
  const { password: _, ...userWithoutPassword } = db.data.users[userIndex];
  res.json(userWithoutPassword);
});

export const userRouter = router;