import path from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'app.json');

const defaultData = {
  users: [],
  user_photos: [],
  user_interests: [],
  swipes: [],
  matches: [],
  messages: [],
  date_ideas: [],
  date_idea_applicants: []
};

export const db = new Low(new JSONFile(dbPath), defaultData);

export async function migrate() {
  await db.read();
  db.data ||= structuredClone(defaultData);
  await db.write();
}

export async function seedIfEmpty() {
  await db.read();
  if (db.data.users.length > 0) return;

  const users = [
    { id: 0, name: 'Riley', age: 26, vibe: 'Curious & Kind', bio: 'Tech enthusiast who enjoys weekend getaways and trying new recipes. I\'m always down for a good conversation over coffee or a competitive board game night.' , photos: ['https://picsum.photos/id/1005/800/1200','https://picsum.photos/id/1006/800/1200','https://picsum.photos/id/1008/800/1200'], interests: ['Technology','Board Games','Cooking','Travel','Documentaries']},
    { id: 1, name: 'Alex', age: 28, vibe: 'Creative Explorer', bio: 'Adventurous spirit with a love for spicy food and indie films. Looking for someone to join me on my next quest, whether it\'s finding the best tacos in town or hiking a new trail.', photos: ['https://picsum.photos/id/1011/800/1200','https://picsum.photos/id/1012/800/1200','https://picsum.photos/id/1013/800/1200'], interests: ['Hiking','Indie Films','Photography','Cooking','Live Music']},
    { id: 2, name: 'Brenda', age: 25, vibe: 'Witty & Ambitious', bio: 'Software engineer by day, aspiring pastry chef by night. My love language is freshly baked croissants. Let\'s talk about code, cats, or conspiracy theories.', photos: ['https://picsum.photos/id/1027/800/1200','https://picsum.photos/id/1028/800/1200','https://picsum.photos/id/1029/800/1200'], interests: ['Baking','Cats','Tech','Board Games','Podcasts']},
    { id: 3, name: 'Carlos', age: 31, vibe: 'Chill Musician', bio: 'Just a guy who loves his dog, playing guitar, and long walks on the beach (seriously). Trying to find someone who doesn\'t mind my terrible singing.', photos: ['https://picsum.photos/id/1041/800/1200','https://picsum.photos/id/1042/800/1200','https://picsum.photos/id/1043/800/1200'], interests: ['Guitar','Dogs','Beach Trips','Craft Beer','Comedy Shows']},
    { id: 4, name: 'Diana', age: 29, vibe: 'Artistic Globetrotter', bio: 'Graphic designer with an eye for aesthetics and a heart for travel. I\'m probably planning my next trip right now. Fluent in sarcasm and coffee.', photos: ['https://picsum.photos/id/1062/800/1200','https://picsum.photos/id/1063/800/1200','https://picsum.photos/id/1065/800/1200'], interests: ['Travel','Art Museums','Graphic Design','Coffee Shops','Yoga']},
    { id: 5, name: 'Ethan', age: 27, vibe: 'Energetic & Motivated', bio: 'Fitness enthusiast and personal trainer. I believe a healthy body leads to a healthy mind. Looking for a workout partner and a partner in crime.', photos: ['https://picsum.photos/id/1074/800/1200','https://picsum.photos/id/1075/800/1200','https://picsum.photos/id/1076/800/1200'], interests: ['Weightlifting','Running','Meal Prep','Action Movies','Reading']}
  ];
  db.data.users.push(...users.map(({photos,interests, ...rest}) => rest));
  for (const u of users) {
    u.photos.forEach(url => db.data.user_photos.push({ user_id: u.id, url }));
    u.interests.forEach(interest => db.data.user_interests.push({ user_id: u.id, interest }));
  }

  const now = new Date().toISOString();
  const m1Id = 1; db.data.matches.push({ id: m1Id, user1_id: 0, user2_id: 1, matched_at: now });
  db.data.messages.push({ id: 1, match_id: m1Id, sender_id: 1, text: 'Hey! Loved your profile, especially the part about indie films. Seen anything good lately?', timestamp: now });
  db.data.messages.push({ id: 2, match_id: m1Id, sender_id: 0, text: "Hey Alex! Thanks :) I just saw 'Past Lives' and it was amazing. You?", timestamp: now });
  db.data.messages.push({ id: 3, match_id: m1Id, sender_id: 1, text: "Oh, I've been wanting to see that! I'm adding it to my list. I recently watched 'Everything Everywhere All at Once' for the third time haha.", timestamp: now });

  const m2Id = 2; db.data.matches.push({ id: m2Id, user1_id: 0, user2_id: 5, matched_at: now });
  db.data.messages.push({ id: 4, match_id: m2Id, sender_id: 4, text: 'Your gym pics are super impressive! You must live there lol.', timestamp: now });
  db.data.messages.push({ id: 5, match_id: m2Id, sender_id: 0, text: 'Haha thanks! I do spend a lot of time there. Gotta burn off all the pizza I eat.', timestamp: now });

  const d1 = 1; db.data.date_ideas.push({ id: d1, creator_id: 1, title: 'Hike to Sunrise Point', description: "Let's catch the sunrise from the best viewpoint in the city. I'll bring the coffee and donuts if you bring the good vibes. It's an early start, but totally worth it!", location: 'Eagle Peak Trailhead', created_at: now });
  db.data.date_idea_applicants.push({ date_idea_id: d1, user_id: 2 }); db.data.date_idea_applicants.push({ date_idea_id: d1, user_id: 4 });
  const d2 = 2; db.data.date_ideas.push({ id: d2, creator_id: 2, title: 'Competitive Baking Night', description: "Think you can bake? Let's have a friendly bake-off.", location: 'My Place (I have all the gear!)', created_at: now });
  db.data.date_idea_applicants.push({ date_idea_id: d2, user_id: 5 });
  const d3 = 3; db.data.date_ideas.push({ id: d3, creator_id: 4, title: 'Stargazing & Picnic', description: 'Looking for someone to join me for a chill night out of the city.', location: 'Lakeview Observatory Park', created_at: now });
  db.data.date_idea_applicants.push({ date_idea_id: d3, user_id: 1 }); db.data.date_idea_applicants.push({ date_idea_id: d3, user_id: 3 });

  await db.write();
}

export function getUserWithDetails(id) {
  const u = db.data.users.find(u => u.id === id);
  if (!u) return null;
  const photos = db.data.user_photos.filter(p => p.user_id === id).map(p => p.url);
  const interests = db.data.user_interests.filter(i => i.user_id === id).map(i => i.interest);
  return { ...u, photos, interests };
}

export function nextId(arr) {
  return (arr.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1) || 1;
}
