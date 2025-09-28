import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { User, Match, DateIdea } from '../../src/types';

// Define the database schema
interface DBSchema {
  users: User[];
  matches: Match[];
  dateIdeas: DateIdea[];
  swipes: {
    id: number;
    swiperId: number;
    swipedId: number;
    direction: 'left' | 'right';
    timestamp: string;
  }[];
}

// Create a type-safe db instance
const adapter = new JSONFile<DBSchema>(join(__dirname, '../data/db.json'));
const db = new Low(adapter, {
  users: [],
  matches: [],
  dateIdeas: [],
  swipes: []
});

export const initDB = async () => {
  await db.read();
  return db;
};

export { db };