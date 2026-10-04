---
target: "home (app/pages/index.vue) + article (app/pages/[...slug].vue)"
date: 2026-10-04
method: dual-agent; deterministic engine not vendored (manual scan)
total_score: 22
max_score: 32
na_heuristics: "5,10"
p0_count: 0
p1_count: 2
---

# Critique: home + article (run 2, after #139/#140)

Scores: H1 3 · H2 3 · H3 3 · H4 2 · H5 n/a · H6 3 · H7 2 · H8 3 · H9 3 · H10 n/a = 22/32 (69%, Acceptable)

Owner's gut read: still looks AI-made and lame. Usability rose; specificity did not.

## Priority issues

1. [P1] Frame skeleton is still the generic hairline Mincho blog; #139 added signs (bleed, 記録 NNN, 目次 counters, 書いた人) on top instead of changing the skeleton. Themed vocabulary reads as costume. → shape / distill
2. [P1] Otherworld barely reaches the eye on desktop dark: 60% radial pool flat across the whole column + dim shader; mobile is a uniform 42% dimmer. → bolder (frame only)
3. [P2] Bleed repeated (masthead, hero, every h2, footer, row hover) + identical bleed-in entrance on every carrier: a pattern, not a mark. → distill
4. [P2] Flat prose hierarchy: h3 1.25rem vs body 1.1875rem, one weight. → typeset
5. [P2] Header controls mean opposite things (表|裏 = state, Lucide eye/wind = action), stock icons are the last stock iconography. → clarify

## Evidence (manual scan)

- Non-current 表/裏 glyph 2.06:1 dark / 1.92:1 light
- Targets <44: footer author 32h, RSS 33w, 目次 links 35h, heading anchors 26-35h, logo 34h
- No color-scheme declared; 404 title lacks site suffix; fixed visually-hidden labels on wall/fog toggle
- Record numbers derive from list position (renumber on delete/backdate)
- Zero: gradient text, side border >1px, bounce, pure black, nested cards, overused fonts; no overflow at 375
