# Blue Steel Baseball — bluesteelbaseball.com

Team website for Blue Steel Baseball, a select program in Sanger, TX fielding 10U and 14U teams.

Static multi-page site — no build step, no framework, no dependencies to install. Push to `main` and Vercel deploys it as-is.

## Structure 

```
index.html        Home — hero, live scoreboard, teams, program, tryouts CTA
schedule.html     Schedule & results (10U / 14U / All tabs)
watch.html        Live stream takeover + YouTube uploads + game archive
gallery.html      Photo gallery (designed empty state until season one photos exist)
contact.html      Tryouts & contact
admin.html        Team admin (Supabase auth) — post scores, add games,
                  announcement bar, add/remove media
404.html          Custom not-found page
css/site.css      The whole design system
js/config.js      Site config: Supabase URL/key, YouTube, socials, contact email
js/data.js        Shared data layer (Supabase queries, formatting, nav/announcement)
assets/           Logo, favicon, og image
vercel.json       cleanUrls (so /schedule works without .html)
```

## How data works

All live content (games, scores, teams, announcements, media) comes from Supabase —
`bluesteel` schema, read-only to the public via RLS. The key in `js/config.js` is the
publishable (browser-safe) key. Writes only work for signed-in admin emails.

To update content, use **/admin** on the live site — no code changes or deploys needed for:
- posting scores / marking games live or final
- adding or deleting games
- the announcement bar (clay strip at the top of every page)
- adding photos (image URL) or highlight videos (YouTube URL)

## Local preview

Any static server works:

```
npx serve .
# or
python3 -m http.server 8000
```

Note: locally, pages are at `/schedule.html`; the clean `/schedule` URLs come from
Vercel (`cleanUrls`).

## Design system (v2 — "Night Game")

- Palette: graphite-navy field, warm chalk lines, ice-steel blue, infield clay
- Type: Tanker (display), Supreme (body), Martian Mono (scoreboard data)
- Corners: chamfered "steel plate" cuts (`.plate`, `.plate-sm`) instead of border-radius
- Game rows are chalk-ruled lines; the announcement bar and tryouts CTA use clay
