# Share images (Open Graph / Twitter cards)

`generate-og.mjs` renders a 1200×630 JPEG share card for each key page and writes:

- `public/og/<type>/<slug>.jpg`: the images, committed to git
  - `words/<word slug>`: top 300 words by frequency (`OG_TOP_WORDS` to change)
  - `names/<slug>`: all 99 Names of Allah
  - `surah/<number>`: every surah in `SURAH_PAGES`
  - `collections/<id>`: every published collection
  - `pages/{home,names-of-allah,ramadan,review}`
- `public/og-image.png`: the default card (same design as `pages/home`), used by `index.html` and any page without its own image
- `src/utils/generated/og-manifest.ts`: the slugs that have an image. `ogImage(type, slug)` in `src/utils/og-image.ts` reads it, and pages pass the result to `<SEO image=…>`. A page with no image falls back to the default.

The Lovable host has no Chromium, so the build never renders images. **Regenerate them locally and commit the result** whenever the data behind them changes: new or renamed words, word frequencies, names, surah pages, collections, or the Ramadan plan numbers.

## Run

```sh
# needs Playwright with Chromium: npm i -g playwright && npx playwright install chromium
node scripts/og/generate-og.mjs                  # everything (about 1 minute)
node scripts/og/generate-og.mjs --only=surah     # one type: words|names|surah|collections|pages (comma-separated)
node scripts/og/generate-og.mjs --limit=3        # quick preview: first 3 of each type
node scripts/og/generate-og.mjs --quality=80     # JPEG quality (default 76)
```

`sharp` is optional. If the script can find it, it compresses with mozjpeg, which makes files about 30% smaller than Chromium's encoder. The script looks for `playwright` and `sharp` in the project, then in `$OG_DEPS` (a folder whose `node_modules` has them), then in the global npm root. You can install both outside the project like this:

```sh
mkdir -p /tmp/og-deps && (cd /tmp/og-deps && npm init -y && npm i sharp)
OG_DEPS=/tmp/og-deps node scripts/og/generate-og.mjs
```

A full run removes images for pages that no longer exist, then rewrites the manifest from the files on disk. Check a few outputs before you commit. Long Arabic text and long titles shrink to fit, but they are worth a look.

## How it works

- `og-data.ts` imports the app's own data modules. The script bundles it with the project's esbuild and dumps one JSON file, so the cards always match the site.
- The template is inline HTML/CSS in `generate-og.mjs`: brand teal (`--primary` 195 83% 38%), the cream site background and the logo from `public/lovable-uploads`. Fonts are vendored in `fonts/` (OFL licences included), so a run needs no network:
  - **Scheherazade New** for Arabic. The Google Fonts build of Amiri that the site uses does not attach harakat to their letters under HarfBuzz/Chromium: the marks float above the word. Amiri Quran has the same problem.
  - **Inter** for Latin text.
- Total size is about 25 MB (about 45 KB per image).
