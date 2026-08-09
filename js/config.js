// Blue Steel Baseball — site configuration
export const SUPABASE_URL = 'https://yeykyutsbeqjcgdxlucn.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_SLM96UPQ3Rgrf6MTpXRZUQ_LklkFhPH'; // publishable (safe for browsers)

export const YT_CHANNEL_URL = 'https://www.youtube.com/@BlueSteelBaseball';
export const YT_UPLOADS_PLAYLIST = 'UUFb6_Nt_4asM-syOSy81AZg';

// GameChanger has no public API, but your team has one shareable "GameStream"
// link that stays the same across every game — fans bookmark it to follow live
// scores (and video). To get it: open web.gc.com, sign in, go to your team, and
// copy the team URL from the address bar. Paste it below. Leave '' to hide the
// "Follow live on GameChanger" button everywhere.
export const GC_TEAM_URL = 'https://web.gc.com/teams/VIemcjQNJ8sO';

export const SOCIALS = [
  { name: 'Facebook', url: 'https://www.facebook.com/BlueSteelBaseball/' },
  { name: 'Instagram', url: 'https://www.instagram.com/bluesteelbaseballtx' },
  { name: 'YouTube', url: YT_CHANNEL_URL },
  { name: 'TikTok', url: 'https://www.tiktok.com/@blue.steel.basebal' },
];

export const CONTACT_EMAIL = 'bluesteelbaseball@gmail.com';
export const TIME_ZONE = 'America/Chicago';
