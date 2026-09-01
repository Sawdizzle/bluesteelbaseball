// Blue Steel Baseball — site configuration
export const SUPABASE_URL = 'https://yeykyutsbeqjcgdxlucn.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_SLM96UPQ3Rgrf6MTpXRZUQ_LklkFhPH'; // publishable (safe for browsers)

export const YT_CHANNEL_URL = 'https://www.youtube.com/@BlueSteelBaseball';
export const YT_UPLOADS_PLAYLIST = 'UUFb6_Nt_4asM-syOSy81AZg';

// GameChanger has no public API, but each team publishes two shareable things:
//   teamUrl  — the "GameStream" link fans bookmark to follow live scores/video.
//              Open web.gc.com, sign in, pick the team, copy the address bar.
//   widgetId — the UUID behind an embeddable schedule widget. In GameChanger:
//              team → Settings → Website Widget → Schedule → copy the id out of
//              the embed snippet (it looks like 27f4e868-6c00-...). Leave it ''
//              and the site links out to that team's GameChanger page instead
//              of embedding the schedule.
export const GC_TEAMS = [
  {
    label: '11U',
    teamUrl: 'https://web.gc.com/teams/f5WaU1uVswZQ',
    widgetId: '',
  },
  {
    label: '14U',
    teamUrl: 'https://web.gc.com/teams/VIemcjQNJ8sO',
    widgetId: '27f4e868-6c00-4dc2-8b36-641c3b631e7f',
  },
];

export const SOCIALS = [
  { name: 'Facebook', url: 'https://www.facebook.com/BlueSteelBaseball/' },
  { name: 'Instagram', url: 'https://www.instagram.com/bluesteelbaseballtx' },
  { name: 'YouTube', url: YT_CHANNEL_URL },
  { name: 'TikTok', url: 'https://www.tiktok.com/@blue.steel.basebal' },
];

export const CONTACT_EMAIL = 'bluesteelbaseball@gmail.com';
export const TIME_ZONE = 'America/Chicago';
