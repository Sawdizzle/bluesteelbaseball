// Blue Steel — live scoreboard data layer (shared by overlay + control)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from '../js/config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { db: { schema: 'bluesteel' } });

// The single live-state row.
export async function getScoreboard() {
  const { data, error } = await sb.from('scoreboard').select('*').eq('id', 1).single();
  if (error) throw error;
  return data;
}

// Fire `handler(newRow)` on every change. Returns an unsubscribe fn.
export function onScoreboard(handler) {
  const ch = sb
    .channel('bluesteel-scoreboard')
    .on('postgres_changes', { event: '*', schema: 'bluesteel', table: 'scoreboard' },
        (payload) => handler(payload.new))
    .subscribe();
  return () => { try { sb.removeChannel(ch); } catch { /* noop */ } };
}

// PIN-checked write. `patch` is a partial state object — only its keys change.
export async function setScoreboard(creds, patch) {
  const { data, error } = await sb.rpc('scoreboard_set', {
    p_username: creds.username, p_pin: creds.pin, p_state: patch,
  });
  if (error) throw new Error(error.message || 'Update failed');
  return data;
}

// Reuse the existing team admin login (same username + PIN as /admin).
export async function adminLogin(username, pin) {
  const { data, error } = await sb.rpc('admin_login', { p_username: username, p_pin: pin });
  if (error) throw new Error(error.message || 'Sign-in failed');
  return data === true;
}
