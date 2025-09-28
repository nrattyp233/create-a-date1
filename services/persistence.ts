import { DateIdea, Match, Message, User } from '../types';
import * as local from './storage';

const API_BASE = import.meta.env.VITE_API_BASE;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const persistence = {
  async login(userId: number): Promise<User> {
    if (!API_BASE) { local.setCurrentUser(local.getUsers().find(u => u.id === userId) || null); return local.getCurrentUser() as User; }
    const user = await api<User>('/api/login', { method: 'POST', body: JSON.stringify({ userId }) });
    return user;
  },
  async feed(userId: number): Promise<User[]> {
    if (!API_BASE) return local.getPendingSwipeUsers(userId);
    return api<User[]>(`/api/feed/${userId}`);
  },
  async swipe(swiperId: number, swipedId: number, direction: 'left' | 'right'): Promise<void> {
    if (!API_BASE) return local.addSwipe({ swiperId, swipedId, direction, ts: new Date().toISOString() });
    await api('/api/swipes', { method: 'POST', body: JSON.stringify({ swiperId, swipedId, direction }) });
  },
  async matches(userId: number): Promise<Match[]> {
    if (!API_BASE) return local.getMatches();
    return api<Match[]>(`/api/matches/${userId}`);
  },
  async sendMessage(matchId: number, senderId: number, text: string): Promise<Message> {
    if (!API_BASE) {
      const msg: Message = { id: Math.random(), senderId, text, timestamp: new Date().toISOString() } as Message;
      local.appendMessage(matchId, msg);
      return msg;
    }
    return api<Message>('/api/messages', { method: 'POST', body: JSON.stringify({ matchId, senderId, text }) });
  },
  async getDateIdeas(): Promise<DateIdea[]> {
    if (!API_BASE) return local.getDateIdeas();
    return api<DateIdea[]>('/api/date-ideas');
  },
  async addDateIdea(idea: DateIdea): Promise<void> {
    if (!API_BASE) return local.addDateIdea(idea);
    await api('/api/date-ideas', { method: 'POST', body: JSON.stringify({ creatorId: idea.creator.id, title: idea.title, description: idea.description, location: idea.location }) });
  },
};
