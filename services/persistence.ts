import { DateIdea, Match, Message, User } from '../types';
import * as local from './storage';

const SHEET_API = import.meta.env.VITE_BACKEND_URL;

// Helper function for making API calls to Sheet.best
async function api<T>(endpoint: string = '', method: string = 'GET', body?: any): Promise<T> {
  try {
    const url = `${SHEET_API}${endpoint}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error('API request failed');
    return res.json();
  } catch (error) {
    console.error('Sheet.best API error:', error);
    throw error;
  }
}

export const persistence = {
  async login(userId: number): Promise<User> {
    if (!SHEET_API) { 
      local.setCurrentUser(local.getUsers().find(u => u.id === userId) || null); 
      return local.getCurrentUser() as User; 
    }
    try {
      const users = await api<User[]>('/users');
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  async updateProfile(userId: number, updates: Partial<User>): Promise<User> {
    if (!SHEET_API) {
      const user = local.getUsers().find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      Object.assign(user, updates);
      local.setCurrentUser(user);
      return user;
    }
    try {
      const result = await api<User>(`/users/${userId}`, 'PUT', updates);
      return result;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  },

  async feed(userId: number): Promise<User[]> {
    if (!SHEET_API) return local.getPendingSwipeUsers(userId);
    try {
      const users = await api<User[]>();
      // Filter out the current user and already swiped users
      const swipes = await api<any[]>('/swipes');
      const swipedIds = swipes
        .filter(s => s.swiperId === userId)
        .map(s => s.swipedId);
      return users.filter(u => u.id !== userId && !swipedIds.includes(u.id));
    } catch (error) {
      console.error('Feed fetch failed:', error);
      throw error;
    }
  },

  async swipe(swiperId: number, swipedId: number, direction: 'left' | 'right'): Promise<void> {
    if (!SHEET_API) return local.addSwipe({ swiperId, swipedId, direction, ts: new Date().toISOString() });
    try {
      await api<void>('/swipes', 'POST', { swiperId, swipedId, direction, timestamp: new Date().toISOString() });
      
      // Check for match if it's a right swipe
      if (direction === 'right') {
        const swipes = await api<any[]>('/swipes');
        const hasMatch = swipes.some(s => 
          s.swiperId === swipedId && 
          s.swipedId === swiperId && 
          s.direction === 'right'
        );
        
        if (hasMatch) {
          await api<void>('/matches', 'POST', { 
            user1Id: swiperId,
            user2Id: swipedId,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Swipe failed:', error);
      throw error;
    }
  },

  async matches(userId: number): Promise<Match[]> {
    if (!SHEET_API) return local.getMatches();
    try {
      const matches = await api<Match[]>('/matches');
      return matches.filter(m => 
        m.user1Id === userId || m.user2Id === userId
      );
    } catch (error) {
      console.error('Matches fetch failed:', error);
      throw error;
    }
  },

  async sendMessage(matchId: number, senderId: number, text: string): Promise<Message> {
    if (!SHEET_API) {
      const msg: Message = { id: Math.random(), senderId, text, timestamp: new Date().toISOString() } as Message;
      local.appendMessage(matchId, msg);
      return msg;
    }
    try {
      const message = { matchId, senderId, text, timestamp: new Date().toISOString() };
      const result = await api<Message>('/messages', 'POST', message);
      return result;
    } catch (error) {
      console.error('Message send failed:', error);
      throw error;
    }
  },

  async getMessages(matchId: number): Promise<Message[]> {
    if (!SHEET_API) return local.getMessages(matchId);
    try {
      const messages = await api<Message[]>('/messages');
      return messages.filter(m => m.matchId === matchId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('Messages fetch failed:', error);
      throw error;
    }
  },

  async getDateIdeas(): Promise<DateIdea[]> {
    if (!SHEET_API) return local.getDateIdeas();
    try {
      return await api<DateIdea[]>('/date-ideas');
    } catch (error) {
      console.error('Date ideas fetch failed:', error);
      throw error;
    }
  },

  async addDateIdea(idea: DateIdea): Promise<void> {
    if (!SHEET_API) return local.addDateIdea(idea);
    try {
      await api<void>('/date-ideas', 'POST', {
        creatorId: idea.creator.id,
        title: idea.title,
        description: idea.description,
        location: idea.location,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Date idea creation failed:', error);
      throw error;
    }
  },
};
