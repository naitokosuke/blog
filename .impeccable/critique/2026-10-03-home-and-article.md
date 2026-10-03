---
target: "home (app/pages/index.vue) + article (app/pages/[...slug].vue)"
date: 2026-10-03
method: dual-agent; deterministic engine not vendored (manual scan)
total_score: 17
max_score: 32
na_heuristics: "5,10"
p0_count: 0
p1_count: 3
---

# Critique: home + article

Scores: H1 2 · H2 3 · H3 3 · H4 2 · H5 n/a · H6 2 · H7 2 · H8 2 · H9 1 · H10 n/a = 17/32 (53%, Acceptable)

## Priority issues

1. [P1] The world stops at the background; the frame (masthead, header, openers, list) is a generic "quiet archive blog" template. The only bridge is one invisible 2.5rem×1px blood stroke repeated on .year / .hero / .prose h2. Masthead h1 repeats the logo. → bolder / shape
2. [P1] Link cards: 1px boxes with full-colour OG thumbnails, the most saturated element on every article (app/content/link-card.vue). → colorize / quieter
3. [P1] No app/error.vue: 404 is Nuxt's default white English page. → harden
4. [P2] Dark calm band (default.vue `.dark .layout::before`) reads as a panel on desktop and swallows the shader on mobile. → adapt / polish
5. [P2] Article end and wayfinding thin: no 目次 for 12-section posts, bordered 38px icon squares with old Twitter bird, stacked hairlines, footer repeats logo. → layout / clarify

## Detector-equivalent (manual) hits

- Colored border-left >1px: main.css blockquote (2px blood), pre (2px rust)
- Touch targets 38×38 < 44: header (4), share (2)
- Focus ring 1px; English aria-labels on lang="ja"; no skip link; copy-URL state not announced
- 20 font-size declarations, 17px px-unit outlier in theme-toggle
- Contrast: all AA pass; light fog over secondary text at-risk (4.65)
- Zero: gradient text, bounce, pure black, gray-on-color, nested cards, overused fonts
