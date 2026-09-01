// Blue Steel Baseball — GameChanger schedule embeds
//
// GameChanger's SDK renders one team's schedule per widget id, so a program
// with two rosters needs one embed each. Teams configured without a widget id
// (see GC_TEAMS in config.js) get a link out to their GameChanger page instead,
// which keeps the section useful until the widget is generated.
import { GC_TEAMS } from './config.js';
import { esc } from './data.js';

const SDK_SRC = 'https://widgets.gc.com/static/js/sdk.v1.js';

let sdkLoad;
function loadSdk() {
  sdkLoad ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SDK_SRC;
    s.async = true;
    s.onload = () => (window.GC ? resolve(window.GC) : reject(new Error('GC missing')));
    s.onerror = () => reject(new Error('GameChanger widget SDK failed to load'));
    document.head.appendChild(s);
  });
  return sdkLoad;
}

function linkOut(team) {
  if (!team.teamUrl) {
    return `<p class="empty">${esc(team.label)}'s schedule isn't posted yet.</p>`;
  }
  return `<p class="empty">${esc(team.label)}'s schedule lives on GameChanger —
    <a href="${esc(team.teamUrl)}" target="_blank" rel="noopener noreferrer" style="color: var(--steel);">follow the team live</a>.</p>`;
}

// Render a schedule block per configured team into `el` (selector or element).
export async function mountSchedules(el, { maxGames = 5 } = {}) {
  const host = typeof el === 'string' ? document.querySelector(el) : el;
  if (!host) return;

  const teams = GC_TEAMS.filter((t) => t.widgetId || t.teamUrl);
  if (!teams.length) {
    host.hidden = true;
    return;
  }

  const showHeads = teams.length > 1;
  host.classList.add('gc-teams');
  host.innerHTML = teams.map((t, i) => `
    <section class="gc-team">
      ${showHeads ? `<div class="gc-team__head">
        <h3>${esc(t.label)}</h3>
        ${t.teamUrl ? `<a href="${esc(t.teamUrl)}" target="_blank" rel="noopener noreferrer">On GameChanger →</a>` : ''}
      </div>` : ''}
      <div class="gc-embed plate" id="gc-team-${i}">${t.widgetId ? '' : linkOut(t)}</div>
    </section>`).join('');

  const embeds = teams.map((t, i) => ({ t, i })).filter(({ t }) => t.widgetId);
  if (!embeds.length) return;

  try {
    await loadSdk();
    for (const { t, i } of embeds) {
      window.GC.team.schedule.init({
        target: `#gc-team-${i}`,
        widgetId: t.widgetId,
        maxVerticalGamesVisible: maxGames,
      });
    }
  } catch {
    // GameChanger unreachable — leave the link out rather than a stuck spinner.
    for (const { t, i } of embeds) {
      document.getElementById(`gc-team-${i}`).innerHTML = linkOut(t);
    }
  }
}
