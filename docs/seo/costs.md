# DataForSEO API spend log (quranvocab.com keyword research, 2026-11-09)

Account balance check: $22.041001 after the first test call -> $19.521161 at the end = **$2.52 measured**; plus the first test call (~$0.09, same price as every other google_ads search_volume call) = **~$2.61 total**. Budget: $6. Calls 2-29 sum to $2.52, matching the measured balance drop.

Free calls not listed: /v3/appendix/user_data x3 (cost 0), docs lookups.

| # | label | endpoint | reported cost (USD) |
|---|---|---|---|
| 1 | test_3kw (before first balance check) | keywords_data/google_ads/search_volume/live | ~0.09 (est; ai-mode hides cost) |
| 2 | us_b1 | keywords_data/google_ads/search_volume/live | 0.09 |
| 3 | us_b2 | keywords_data/google_ads/search_volume/live | 0.09 |
| 4 | global | keywords_data/google_ads/search_volume/live | 0.09 |
| 5 | uk | keywords_data/google_ads/search_volume/live | 0.09 |
| 6 | ca | keywords_data/google_ads/search_volume/live | 0.09 |
| 7 | in | keywords_data/google_ads/search_volume/live | 0.09 |
| 8 | pk | keywords_data/google_ads/search_volume/live | 0.09 |
| 9 | ng | keywords_data/google_ads/search_volume/live | 0.09 |
| 10 | my | keywords_data/google_ads/search_volume/live | 0.09 |
| 11 | ov_us | dataforseo_labs/google/keyword_overview/live | 0.08112 |
| 12 | ideas_core | dataforseo_labs/google/keyword_ideas/live | 0.072 |
| 13 | sugg_islam | dataforseo_labs/google/keyword_suggestions/live | 0.06 |
| 14 | sugg_inarabic | dataforseo_labs/google/keyword_suggestions/live | 0.06 |
| 15 | sugg_inquran | dataforseo_labs/google/keyword_suggestions/live | 0.048 |
| 16 | rk_myislam | dataforseo_labs/google/ranked_keywords/live | 0.072 |
| 17 | rk_corpus | dataforseo_labs/google/ranked_keywords/live | 0.06 |
| 18 | rk_uq | dataforseo_labs/google/ranked_keywords/live | 0.048 |
| 19 | rk_quranicvocab | dataforseo_labs/google/ranked_keywords | 0.01248 |
| 20 | rk_self(quranvocab.com) | dataforseo_labs/google/ranked_keywords | 0.01224 |
| 21 | serp x7 (quran word by word, ar rahman meaning, taqwa meaning, most common words in the quran, surah mulk in english, quranic arabic, root word of rahman) | serp/google/organic/live/regular | ~0.014 (est 0.002 each; ai-mode hides cost) |
| 22 | us_b3 | keywords_data/google_ads/search_volume/live | 0.09 |
| 23 | ml_*_aimode x6 (PK-ur, IN-hi, ID-id, BD-bn, TR-tr, MY-ms; AI-mode, truncated, re-run below) | keywords_data/google_ads/search_volume/live | 0.54 (6 x 0.09, inferred from identical calls) |
| 24 | ml_pk (full) | keywords_data/google_ads/search_volume/live | 0.09 |
| 25 | ml_in (full) | keywords_data/google_ads/search_volume/live | 0.09 |
| 26 | ml_id (full) | keywords_data/google_ads/search_volume/live | 0.09 |
| 27 | ml_bd (full) | keywords_data/google_ads/search_volume/live | 0.09 |
| 28 | ml_tr (full) | keywords_data/google_ads/search_volume/live | 0.09 |
| 29 | ml_my (full) | keywords_data/google_ads/search_volume/live | 0.09 |

Notes:
- Costs marked ~ were made in the tool's AI mode, which hides the cost field; values are inferred from identical calls made with full responses (google_ads search_volume = $0.09 per call regardless of 3 or 700 keywords; serp live regular ~ $0.002 each).
- The 6 multilingual calls were run twice: the first (AI mode) truncated each result to 10 rows, so they were re-run with full output. That duplicate cost ~$0.54.
