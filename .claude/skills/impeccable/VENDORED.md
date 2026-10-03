# Vendored Impeccable

Copied by hand from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) instead of running `npx impeccable install`.

- Upstream commit: `e103efe779e2dd01274dabae83531fef00bf2563` (skill 4.5.0, engine 0.1.11)
- Source: the repository's `.claude/skills/impeccable/` and `.claude/agents/impeccable-*.md` (the `dist/claude-code` build synced into the repo root)
- License: Apache-2.0 (`LICENSE`, `NOTICE.md`)

## Included

- `SKILL.md`
- `reference/**/*.md`
- `.claude/agents/impeccable-*.md` (asset-producer, documenter, finish-reviewer, manual-edit-applier)

## Excluded on purpose

- `scripts/` — the `impeccable` launcher downloads and executes a prebuilt engine binary from GitHub Releases on first run, plus `live-browser.js` (minified bundle) and font index data used by that engine.
- The design-detector hooks (`SessionStart` / `PostToolUse` / `Stop` in `.claude/settings.json`), which would run that binary on every edit.

Without the launcher, `SKILL.md` falls back to its documented "Launcher unavailable" path: read `PRODUCT.md` / `DESIGN.md` directly and follow the reference playbooks.
Commands that require the engine (`live`, `generate`, `pin`, `hooks`, the `detect` scan in `routing.md`) are unavailable.
`npx impeccable` is denied in `.claude/settings.json`.

## Updating

Download the upstream tarball, review the diff of the files listed above, and copy them over.
