export type Category = 'All' | 'Tech' | 'Networking' | 'Cultural' | 'Music' | 'Creative' | 'Food & Drink';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: Exclude<Category, 'All'>;
  source: 'Eventbrite' | 'Luma' | 'Meetup' | 'Cerebral Valley';
  attendees: number;
  isFree: boolean;
}

export const CATEGORIES: Category[] = ['All', 'Tech', 'Networking', 'Cultural', 'Music', 'Creative', 'Food & Drink'];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'SF AI Hackathon 2026',
    description: 'Build the next generation of AI-powered apps in 48 hours with $10k in prizes.',
    date: 'Sat, May 23',
    time: '9:00 AM',
    location: 'Moscone Center, SF',
    category: 'Tech',
    source: 'Luma',
    attendees: 342,
    isFree: false,
  },
  {
    id: '2',
    title: 'Bay Area Founders Mixer',
    description: 'Connect with early-stage founders, angels, and operators over drinks.',
    date: 'Thu, May 29',
    time: '7:00 PM',
    location: 'The Battery, SF',
    category: 'Networking',
    source: 'Eventbrite',
    attendees: 128,
    isFree: false,
  },
  {
    id: '3',
    title: 'Lunar New Year Street Fair',
    description: "Celebrate the Year of the Snake with food, music, and cultural performances in Chinatown.",
    date: 'Sun, Jun 1',
    time: '11:00 AM',
    location: 'Chinatown, SF',
    category: 'Cultural',
    source: 'Eventbrite',
    attendees: 2100,
    isFree: true,
  },
  {
    id: '4',
    title: 'Indie Jam: Live at The Fillmore',
    description: 'An unforgettable night of indie and alternative music from Bay Area artists.',
    date: 'Fri, May 30',
    time: '8:00 PM',
    location: 'The Fillmore, SF',
    category: 'Music',
    source: 'Eventbrite',
    attendees: 490,
    isFree: false,
  },
  {
    id: '5',
    title: 'LLM in Production — Cerebral Valley Talks',
    description: 'Engineers from Anthropic, OpenAI, and Cohere share what actually works in prod.',
    date: 'Wed, May 28',
    time: '6:30 PM',
    location: 'Hayes Valley, SF',
    category: 'Tech',
    source: 'Cerebral Valley',
    attendees: 215,
    isFree: true,
  },
  {
    id: '6',
    title: 'Oakland Street Art Festival',
    description: 'A weekend celebrating muralists, graffiti artists, and urban creatives across Oakland.',
    date: 'Sat, May 31',
    time: '10:00 AM',
    location: 'Downtown Oakland',
    category: 'Creative',
    source: 'Eventbrite',
    attendees: 870,
    isFree: true,
  },
  {
    id: '7',
    title: 'Mission District Food Crawl',
    description: 'Explore the best taquerias, bakeries, and hidden gems of the Mission on a guided walk.',
    date: 'Sun, Jun 8',
    time: '12:00 PM',
    location: 'Mission District, SF',
    category: 'Food & Drink',
    source: 'Meetup',
    attendees: 64,
    isFree: false,
  },
  {
    id: '8',
    title: 'Women in Tech Brunch',
    description: 'A relaxed Sunday brunch for women in tech to connect, share stories, and build community.',
    date: 'Sun, Jun 1',
    time: '10:30 AM',
    location: 'SoMa, SF',
    category: 'Networking',
    source: 'Luma',
    attendees: 97,
    isFree: false,
  },
  {
    id: '9',
    title: 'Sketch & Sip: Golden Gate Edition',
    description: 'Bring a sketchbook and join fellow artists for a creative session in the park.',
    date: 'Sat, Jun 7',
    time: '3:00 PM',
    location: 'Golden Gate Park, SF',
    category: 'Creative',
    source: 'Meetup',
    attendees: 43,
    isFree: true,
  },
];
