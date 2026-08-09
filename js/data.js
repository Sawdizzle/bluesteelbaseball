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
