
import { User, DateIdea, Match, Message } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'Alex',
    age: 28,
    bio: "Adventurous spirit with a love for spicy food and indie films. Looking for someone to join me on my next quest, whether it's finding the best tacos in town or hiking a new trail.",
    vibe: "Creative Explorer",
    photos: ['https://picsum.photos/id/1011/800/1200', 'https://picsum.photos/id/1012/800/1200', 'https://picsum.photos/id/1013/800/1200'],
    interests: ['Hiking', 'Indie Films', 'Photography', 'Cooking', 'Live Music'],
  },
  {
    id: 2,
    name: 'Brenda',
    age: 25,
    bio: "Software engineer by day, aspiring pastry chef by night. My love language is freshly baked croissants. Let's talk about code, cats, or conspiracy theories.",
    vibe: "Witty & Ambitious",
    photos: ['https://picsum.photos/id/1027/800/1200', 'https://picsum.photos/id/1028/800/1200', 'https://picsum.photos/id/1029/800/1200'],
    interests: ['Baking', 'Cats', 'Tech', 'Board Games', 'Podcasts'],
  },
  {
    id: 3,
    name: 'Carlos',
    age: 31,
    bio: "Just a guy who loves his dog, playing guitar, and long walks on the beach (seriously). Trying to find someone who doesn't mind my terrible singing.",
    vibe: "Chill Musician",
    photos: ['https://picsum.photos/id/1041/800/1200', 'https://picsum.photos/id/1042/800/1200', 'https://picsum.photos/id/1043/800/1200'],
    interests: ['Guitar', 'Dogs', 'Beach Trips', 'Craft Beer', 'Comedy Shows'],
  },
    {
    id: 4,
    name: 'Diana',
    age: 29,
    bio: "Graphic designer with an eye for aesthetics and a heart for travel. I'm probably planning my next trip right now. Fluent in sarcasm and coffee.",
    vibe: "Artistic Globetrotter",
    photos: ['https://picsum.photos/id/1062/800/1200', 'https://picsum.photos/id/1063/800/1200', 'https://picsum.photos/id/1065/800/1200'],
    interests: ['Travel', 'Art Museums', 'Graphic Design', 'Coffee Shops', 'Yoga'],
  },
  {
    id: 5,
    name: 'Ethan',
    age: 27,
    bio: "Fitness enthusiast and personal trainer. I believe a healthy body leads to a healthy mind. Looking for a workout partner and a partner in crime.",
    vibe: "Energetic & Motivated",
    photos: ['https://picsum.photos/id/1074/800/1200', 'https://picsum.photos/id/1075/800/1200', 'https://picsum.photos/id/1076/800/1200'],
    interests: ['Weightlifting', 'Running', 'Meal Prep', 'Action Movies', 'Reading'],
  },
];

export const CURRENT_USER: User = {
    id: 0,
    name: 'Riley',
    age: 26,
    bio: "Tech enthusiast who enjoys weekend getaways and trying new recipes. I'm always down for a good conversation over coffee or a competitive board game night.",
    vibe: "Curious & Kind",
    photos: ['https://picsum.photos/id/1005/800/1200', 'https://picsum.photos/id/1006/800/1200', 'https://picsum.photos/id/1008/800/1200'],
    interests: ['Technology', 'Board Games', 'Cooking', 'Travel', 'Documentaries'],
};

export const MOCK_DATE_IDEAS: DateIdea[] = [
  {
    id: 1,
    creator: MOCK_USERS[0],
    title: 'Hike to Sunrise Point',
    description: "Let's catch the sunrise from the best viewpoint in the city. I'll bring the coffee and donuts if you bring the good vibes. It's an early start, but totally worth it!",
    location: "Eagle Peak Trailhead",
    applicants: [MOCK_USERS[1], MOCK_USERS[3]],
  },
  {
    id: 2,
    creator: MOCK_USERS[1],
    title: 'Competitive Baking Night',
    description: "Think you can bake? Let's have a friendly bake-off. We'll pick a theme and see who can create the most delicious masterpiece. Loser buys the next round of drinks.",
    location: "My Place (I have all the gear!)",
    applicants: [MOCK_USERS[4]],
  },
  {
    id: 3,
    creator: MOCK_USERS[3],
    title: 'Stargazing & Picnic',
    description: "Looking for someone to join me for a chill night out of the city. We'll find a dark spot, lay out a blanket, and enjoy some snacks while we watch the stars. I can even point out a few constellations.",
    location: "Lakeview Observatory Park",
    applicants: [MOCK_USERS[0], MOCK_USERS[2]],
  },
];


const MOCK_CHAT_1: Message[] = [
    { id: 1, senderId: 1, text: "Hey! Loved your profile, especially the part about indie films. Seen anything good lately?", timestamp: "10:30 AM" },
    { id: 2, senderId: 0, text: "Hey Alex! Thanks :) I just saw 'Past Lives' and it was amazing. You?", timestamp: "10:32 AM" },
    { id: 3, senderId: 1, text: "Oh, I've been wanting to see that! I'm adding it to my list. I recently watched 'Everything Everywhere All at Once' for the third time haha.", timestamp: "10:35 AM" },
];

const MOCK_CHAT_2: Message[] = [
    { id: 1, senderId: 4, text: "Your gym pics are super impressive! You must live there lol.", timestamp: "Yesterday" },
    { id: 2, senderId: 0, text: "Haha thanks! I do spend a lot of time there. Gotta burn off all the pizza I eat.", timestamp: "Yesterday" },
];

export const MOCK_MATCHES: Match[] = [
  { id: 1, user: MOCK_USERS[0], lastMessage: "Can't wait to hear your review!", timestamp: "10:35 AM", unread: false, chatHistory: MOCK_CHAT_1 },
  { id: 2, user: MOCK_USERS[4], lastMessage: "You had me at pizza.", timestamp: "Yesterday", unread: true, chatHistory: MOCK_CHAT_2 },
  { id: 3, user: MOCK_USERS[2], lastMessage: "Sounds good! Let's do it.", timestamp: "2 days ago", unread: false, chatHistory: [] },
];
