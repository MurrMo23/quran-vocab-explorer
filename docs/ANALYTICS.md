# Analytics (GA4 `G-16CP5B8EQB`)

Code: `index.html` (gtag snippet + context set before `config`), `src/lib/analytics.ts` (typed `track()`),
`src/lib/analytics-context.ts` (route changes, return visits), `src/lib/progress/session-analytics.ts`
(review funnel), `src/lib/auth-analytics.ts` (Google sign-up/login).
No personal data is ever sent: no emails, names, user ids, note text.

## Page views

- The first `page_view` comes from `gtag('config')` in `index.html`.
- SPA route changes are counted by GA4 enhanced measurement ("Page changes based on browser history
  events", on by default). The app sends **no** manual `page_view`, so nothing is double-counted.
  Check: Admin → Data streams → web stream → Enhanced measurement → Page views → Show advanced settings
  → "Page changes based on browser history events" must be ON.
- `index.html` wraps `history.pushState/replaceState` and listens to `popstate` before gtag.js loads,
  so `page_type` is updated before GA's history `page_view` is queued.

## Parameters on every event

| Param | Scope | Values |
|---|---|---|
| `page_type` | event | `home, word, root, roots_hub, surah, surahs_hub, collection, collections_hub, name, names_hub, review, blog, ramadan, auth, dashboard, other` |
| `landing_page_type` | event | `page_type` of the first page of the session (30 min inactivity timeout, like GA4) |
| `traffic_type` | event | `internal` when this browser was marked with `?internal=1` |
| `first_landing_type` | user property | `page_type` of the very first page this browser ever saw |

The classifier lives in `pageTypeFor()` (`src/lib/analytics.ts`) and is duplicated inline in
`index.html` (must run before `config`): keep both in sync when adding routes or hubs.

## Event dictionary

| Event | Params | Fires |
|---|---|---|
| `review_start` | `source` (`review_due`, `review_words`, `review_collection`, or `practice`/`quiz`/`listening` without a plan), `card_count?`, `mode?` | First answered card of a review session |
| `review_rating` | `rating` (`again/hard/good/easy`), `source`, `mode?` (`yesno/choice/flip`) | Every answered card. Yes/No: Yes → `good`; No + right meaning → `hard`; No + wrong → `again` |
| `review_complete` | `source`, `cards`, `again_count` | Every word of the planned queue answered once |
| `sign_up` | `method` (`email/google`) | Email form submitted for a new address (before email confirmation); Google: on return from OAuth when the account is < 5 min old |
| `login` | `method` | Email sign-in success; Google return for an existing account |
| `return_visit` | `days_since_first`, `bucket` (`d1`, `d2_6`, `d7_29`, `d30plus`) | Once per calendar day on app load, from the day after the first visit (`qv-first-visit` / `qv-last-ping` in localStorage) |
| `cta_click` | `cta`, `location` | Primary CTAs (below) |
| `word_view` | `word_id`, `collection_id?` | Word page shown |
| `audio_play` | `kind` (`pronunciation/word/ayah/related`) | Audio started |
| `goal_selected` | `goal` | Learning goal picked (onboarding chooser or Review settings) |
| `quiz_complete` | `score_pct` | Typed, currently not sent anywhere |
| `collection_create`, `note_create`, `contact_submit`, `ramadan_day_start {day}`, `ramadan_calendar_download`, `exception {description, fatal}` | | As named |

`cta` values: `start_learning` / `continue_learning` (`home_hero`), `sample_not_yet` / `sample_know_it`
(`home_sample`), `start_free` (`nav`, `nav_mobile`), `add_to_review` (`word_hero`), `start_review`
(`word_learn_for_good`), `learn_root_words` (`root_hero`), `review_surah_words` (`surah_review_box`),
`review_collection` (`collection_progress`), `review_all_names` (`names_hub_hero`), `review_name` (`name_actions`).

Review sessions: one session per review queue; Yes/No answers are recorded as `practice` (Yes) and
`quiz` (No → pick), and both count toward the same session. A session ends after 30 min idle, a new
queue, or completion. Re-asked "again" words after completion do not start a new session.

Return-visit caveat: browsers that visited before this shipped get their first-visit date on their
first load after deploy, so day-N numbers are only exact for visitors acquired after the deploy.

## Funnel

1. `first_visit` (or `session_start`) — visitor
2. `review_start` — started a review
3. `review_complete` — completed a review
4. `sign_up`
5. `return_visit` with `bucket = d1` (day 2) / any `bucket` in `d7_29` with `days_since_first ≥ 7` (day 7+)

## GA4 admin setup (one-time)

1. **Key events**: Admin → Data display → Events → mark `review_complete`, `sign_up`, `return_visit` as key
   events (the events appear there after they first fire; or Admin → Key events → New key event and
   type the name).
2. **Custom definitions**: Admin → Data display → Custom definitions → Create custom dimension:
   - Event scope: `page_type`, `landing_page_type`, `cta`, `location`, `source`, `mode`, `rating`, `bucket`
   - User scope: `first_landing_type`
   - Custom metric (event scope, standard unit): `days_since_first`, `card_count`
3. **Internal traffic**:
   - Admin → Data streams → web stream → Configure tag settings → Show all → Define internal traffic →
     Create rule: name `Owner`, `traffic_type` value `internal`, match on an IP that never matches
     (e.g. IP equals `192.0.2.1`). The rule must exist for the filter, but the value is already set by the site.
   - Admin → Data settings → Data filters → the default "Internal Traffic" filter (`traffic_type = internal`,
     Exclude) → leave in **Testing**, check DebugView/Explorations with the "Test data filter name"
     dimension, then switch to **Active**. Activation is not retroactive.
   - Mark each browser/device you use by opening `https://quranvocab.com/?internal=1` once
     (`?internal=0` clears it).
4. **Enhanced measurement**: confirm "Page changes based on browser history events" is ON (see above).

## Recommended Funnel Exploration

Explore → Funnel exploration:

- **Steps** (open funnel off; "is directly followed by" off):
  1. Visit: `first_visit`
  2. Start review: `review_start`
  3. Complete review: `review_complete`
  4. Sign up: `sign_up`
  5. Day 2 return: `return_visit` where `bucket` = `d1`
- **Breakdown**: `landing_page_type` (or user-scoped `first_landing_type`), then switch to
  `Session source / medium` (or `First user source / medium`).
- **Segment comparison** optional: Device category.
- **Show elapsed time**: on. **Date range**: at least 14 days.
- For day-7 retention make a second funnel with step 5 = `return_visit` where `days_since_first` ≥ 7,
  or use Explore → Cohort exploration: inclusion `first_visit`, return criterion `return_visit`, daily.
- Internal traffic is excluded once the data filter is Active (data is dropped at processing). While it
  is in Testing, filter the exploration on "Test data filter name" ≠ `Internal Traffic`.
