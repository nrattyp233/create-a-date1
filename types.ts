
export interface User {
  id: number;
  name: string;
  age: number;
  bio: string;
  vibe: string;
  photos: string[];
  interests: string[];
}

export interface DateIdea {
  id: number;
  creator: User;
  title: string;
  description: string;
  location: string;
  applicants: User[];
}

export interface Match {
  id: number;
  user: User;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  chatHistory: Message[];
}

export interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
}

export enum Page {
    Swipe = 'swipe',
    Marketplace = 'marketplace',
    Matches = 'matches',
    Profile = 'profile'
}
