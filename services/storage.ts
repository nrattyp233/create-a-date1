// Simple localStorage-based persistence layer
// Seeds from constants when no data exists yet

import { CURRENT_USER, MOCK_DATE_IDEAS, MOCK_MATCHES, MOCK_USERS } from '../constants';
import { DateIdea, Match, Message, User } from '../types';

const KEYS = {
  users: 'cad.users',
  currentUser: 'cad.currentUser',
  matches: 'cad.matches',
  dateIdeas: 'cad.dateIdeas',
  swipes: 'cad.swipes', // array of {swiperId, swipedId, direction, ts}
  bg: 'cad.backgroundImage',
};

// Generic helpers
function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Seeding
export function seedIfEmpty() {
  if (!localStorage.getItem(KEYS.users)) setJSON<User[]>(KEYS.users, MOCK_USERS);
  if (!localStorage.getItem(KEYS.matches)) setJSON<Match[]>(KEYS.matches, MOCK_MATCHES);
  if (!localStorage.getItem(KEYS.dateIdeas)) setJSON<DateIdea[]>(KEYS.dateIdeas, MOCK_DATE_IDEAS);
}

// Users / Auth
export function getCurrentUser(): User | null {
  const u = getJSON<User | null>(KEYS.currentUser, null);
  return u;
}

export function setCurrentUser(user: User | null) {
  if (user) setJSON<User>(KEYS.currentUser, user);
  else localStorage.removeItem(KEYS.currentUser);
}

export function updateCurrentUser(patch: Partial<User>) {
  const u = getCurrentUser();
  if (!u) return;
  
  const users = getUsers();
  const index = users.findIndex(user => user.id === u.id);
  if (index >= 0) {
    users[index] = { ...users[index], ...patch };
    setJSON(KEYS.users, users);
  }
  
  setCurrentUser({ ...u, ...patch });
}

export function getMessages(matchId: number): Message[] {
  const matches = getJSON<Match[]>(KEYS.matches, []);
  const messages = getJSON<Message[]>('cad.messages', []);
  return messages.filter(m => m.matchId === matchId);
}
  if (!u) return;
  const next = { ...u, ...patch } as User;
  setCurrentUser(next);
}

export function getUsers(): User[] {
  return getJSON<User[]>(KEYS.users, MOCK_USERS);
}

export function setUsers(users: User[]) {
  setJSON<User[]>(KEYS.users, users);
}

// Background image
export function getBackgroundImage(): string | null {
  return getJSON<string | null>(KEYS.bg, null);
}

export function setBackgroundImage(imageUrl: string) {
  localStorage.setItem(KEYS.bg, JSON.stringify(imageUrl));
}

// Swipes
export type Swipe = { swiperId: number; swipedId: number; direction: 'left' | 'right'; ts: string };

export function getSwipes(): Swipe[] { return getJSON<Swipe[]>(KEYS.swipes, []); }
export function addSwipe(s: Swipe) { setJSON<Swipe[]>(KEYS.swipes, [...getSwipes(), s]); }

export function getPendingSwipeUsers(forUserId: number): User[] {
  const all = getUsers();
  const swipes = getSwipes().filter(s => s.swiperId === forUserId);
  const excluded = new Set(swipes.map(s => s.swipedId));
  return all.filter(u => u.id !== forUserId && !excluded.has(u.id));
}

// Matches / Messages
export function getMatches(): Match[] { return getJSON<Match[]>(KEYS.matches, []); }
export function setMatches(ms: Match[]) { setJSON<Match[]>(KEYS.matches, ms); }

export function appendMessage(matchId: number, msg: Message) {
  const ms = getMatches();
  const idx = ms.findIndex(m => m.id === matchId);
  if (idx === -1) return;
  const m = ms[idx];
  const updated: Match = { ...m, lastMessage: msg.text, timestamp: msg.timestamp, chatHistory: [...m.chatHistory, msg] };
  const next = [...ms];
  next[idx] = updated;
  setMatches(next);
}

// Date ideas
export function getDateIdeas(): DateIdea[] { return getJSON<DateIdea[]>(KEYS.dateIdeas, []); }
export function setDateIdeas(list: DateIdea[]) { setJSON<DateIdea[]>(KEYS.dateIdeas, list); }
export function addDateIdea(idea: DateIdea) { setDateIdeas([idea, ...getDateIdeas()]); }

// Utilities
export function clearAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
