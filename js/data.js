// Blue Steel Baseball — shared data layer
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY, TIME_ZONE } from './config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'bluesteel' },
});

// ---------- queries ----------

export async function getActiveAnnouncement() {
  const { data } = await sb
    .from('announcements')
    .select('message')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1);
  return data?.[0]?.message ?? null;
}

export async function getTeams() {
  const { data, error } = await sb
    .from('teams')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function getNextGame() {
  const { data } = await sb
    .from('games')
    .select('*, teams(name, slug)')
    .gte('game_date', new Date().toISOString())
    .neq('status', 'cancelled')
    .order('game_date', { ascending: true })
    .limit(1);
  return data?.[0] ?? null;
}

export async function getLastResult() {
  const { data } = await sb
    .from('games')
    .select('*, teams(name, slug)')
    .eq('status', 'final')
    .order('game_date', { ascending: false })
    .limit(1);
  return data?.[0] ?? null;
}

export async function getLiveGame() {
  const { data } = await sb
    .from('games')
    .select('*, teams(name, slug)')
    .eq('status', 'live')
    .order('game_date', { ascending: false })
    .limit(1);
  return data?.[0] ?? null;
}

export async function getAllGames() {
  const { data, error } = await sb
    .from('games')
    .select('*, teams(name, slug)')
    .order('game_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getMedia(kind) {
  let q = sb
    .from('media')
    .select('*, teams(name, slug)')
    .order('created_at', { ascending: false });
  if (kind) q = q.eq('kind', kind);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function getStreamedGames() {
  const { data, error } = await sb
    .from('games')
    .select('*, teams(name, slug)')
    .not('stream_url', 'is', null)
    .order('game_date', { ascending: false });
  if (error) throw error;
  return data;
}

// Final games only — the raw material for a season record.
export async function getResults() {
  const { data, error } = await sb
    .from('games')
    .select('our_score, their_score, teams(slug, name)')
    .eq('status', 'final');
  if (error) throw error;
  return data ?? [];
}

// ---------- formatting ----------

const dateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE, weekday: 'short', month: 'short', day: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit',
});
const fullFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE, weekday: 'long', month: 'long', day: 'numeric',
  hour: 'numeric', minute: '2-digit',
});

export const fmtDate = (iso) => dateFmt.format(new Date(iso));
export const fmtTime = (iso) => `${timeFmt.format(new Date(iso))} CT`;
export const fmtFull = (iso) => `${fullFmt.format(new Date(iso))} CT`;

export function resultOf(g) {
  if (g.our_score == null || g.their_score == null) return null;
  if (g.our_score > g.their_score) return 'W';
  if (g.our_score < g.their_score) return 'L';
  return 'T';
}

// Tally W-L-T from final games, optionally filtered to one team slug.
export function recordFrom(results, slug = null) {
  const rec = { w: 0, l: 0, t: 0 };
  for (const g of results) {
    if (slug && g.teams?.slug !== slug) continue;
    const r = resultOf(g);
    if (r === 'W') rec.w++;
    else if (r === 'L') rec.l++;
    else if (r === 'T') rec.t++;
  }
  return rec;
}

// "8-3" or "8-3-1" (ties only shown when they exist). null when no games yet.
export function recordLabel(rec) {
  if (!rec || (rec.w + rec.l + rec.t) === 0) return null;
  return rec.t ? `${rec.w}-${rec.l}-${rec.t}` : `${rec.w}-${rec.l}`;
}

// Google Maps "directions/search" link for a game location.
export function mapsHref(location) {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

// A downloadable .ics file (Apple/Google/Outlook all accept it) for one game.
export function icsHref(game) {
  const start = new Date(game.game_date);
  if (isNaN(start)) return null;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // ~2h ballgame
  const z = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const clean = (s) => String(s ?? '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const vs = game.is_home ? 'vs' : '@';
  const title = `${game.teams?.name ?? 'Blue Steel'} ${vs} ${game.opponent}`;
  const desc = [game.tournament, 'Blue Steel Baseball'].filter(Boolean).join(' · ');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Blue Steel Baseball//EN',
    'BEGIN:VEVENT',
    `UID:${z(start)}-${clean(game.opponent)}@bluesteelbaseball.com`,
    `DTSTART:${z(start)}`, `DTEND:${z(end)}`,
    `SUMMARY:${clean(title)}`,
    game.location ? `LOCATION:${clean(game.location)}` : '',
    `DESCRIPTION:${clean(desc)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean);
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}

export function youTubeId(url) {
  const m = String(url ?? '').match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|live\/|embed\/|shorts\/))([\w-]{11})/
  );
  return m ? m[1] : null;
}

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);

// ---------- realtime ----------

// Fire `handler` whenever any game row changes (score, status, add, delete),
// so live scoreboards update without a page reload. Returns an unsubscribe fn.
// Fails quietly if realtime is unavailable — callers already load once up front.
export function onGamesChange(handler) {
  try {
    const channel = sb
      .channel('bluesteel-games')
      .on('postgres_changes', { event: '*', schema: 'bluesteel', table: 'games' }, handler)
      .subscribe();
    return () => { try { sb.removeChannel(channel); } catch { /* noop */ } };
  } catch {
    return () => {};
  }
}

// ---------- shared UI ----------

export async function mountAnnouncement() {
  const el = document.getElementById('announcement');
  if (!el) return;
  try {
    const msg = await getActiveAnnouncement();
    if (msg) {
      el.textContent = msg;
      el.hidden = false;
    }
  } catch { /* announcement is optional — never break the page for it */ }
}

export function mountNav() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  const here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  links.querySelectorAll('a').forEach((a) => {
    const path = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (path === here) a.setAttribute('aria-current', 'page');
  });
}

export function unavailable(el, what) {
  el.innerHTML = `<p class="empty">${esc(what)} is taking a breather — check our socials for the latest, or try again in a minute.</p>`;
}
