# Blue Steel Baseball — bluesteelbaseball.com

Team website for Blue Steel Baseball, a select program in Sanger, TX fielding 10U and 14U teams.

Static multi-page site — no build step, no framework, no dependencies to install. Push to `main` and Vercel deploys it as-is.

## Structure

```
index.html        Home — hero, GameChanger "Next up" widget, teams, program, tryouts CTA
schedule.html     Schedule & results — GameChanger schedule widget
watch.html        Live stream takeover + YouTube uploads + game archive
gallery.html      Photo gallery (designed empty state until season one photos exist)
contact.html      Tryouts & contact
admin.html        Team admin (passwordless email-code login) —
                  announcement bar, add/remove photos & highlight videos
404.html          Custom not-found page
css/site.css      The whole design system
js/config.js      Site config: Supabase URL/key, GameChanger team URL, YouTube, socials
js/data.js        Shared data layer (Supabase queries, formatting, nav/announcement)
assets/           Logo, favicon, og image, PWA icons
manifest.webmanifest  PWA manifest (add-to-home-screen)
vercel.json       cleanUrls (so /schedule works without .html)
```

## How data works

**Schedule & scores come from GameChanger.** The Home and Schedule pages embed
GameChanger's official schedule widget (`widgets.gc.com`), so game times, results,
and live scores appear automatically — keep score in the GameChanger app, nothing to
enter on the site. The widget id and team URL live in the page markup / `js/config.js`.

**Everything else comes from Supabase** — `bluesteel` schema, read-only to the public
via RLS; the key in `js/config.js` is the publishable (browser-safe) key. Writes only
work for signed-in admin emails (see `bluesteel.admins`).

To update content, use **/admin** on the live site (sign in with an email code — no
password). No code changes or deploys needed for:
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
