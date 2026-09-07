# Mouse-scrub portfolio hero implementation plan

**Goal:** Reproduce the supplied hero interaction and layout, retaining the Chinese personal portfolio and all lower sections, as approved in chat.

**Architecture:** React/TypeScript owns the navigation and hero. Vite bundles these and the existing lower-section controller. Tailwind utilities style the new components without resetting legacy content. No router, UI library, animation dependency or unrelated lower-section rewrite.

**Spec:** User's detailed Mainframe hero specification in the conversation; approved adaptation replaces agency identity with personal portfolio copy and existing destinations.

## Constraints

- Black, white and gray. Fonts from the two supplied links; heading family only for logo.
- Video muted, inline, no autoplay. Horizontal delta / width * 0.8 * duration; clamp and serialize seeks, coalescing queued input.
- Typewriter 38 ms/character after 600 ms; pills appear independently at 400 ms.
- Mobile menu with three animated bars; Escape, focus containment and focus return. Touch/keyboard video control must not block page scroll.
- Keep all projects, filters, archive, resume and contact destinations. Mark reference video and placeholder contact honestly.
- Build/test locally; no public deployment of this draft or changes to git metadata.

## Tasks

- [x] Add test first for scrub delta, clamp, invalid metadata, seek coalescing and reverse input while seeking. Run `node --test test/hero.test.mjs`, confirm failure, then implement the controller.
- [x] Mount React hero/navigation with responsive Tailwind layout, reduced-motion fallback, accessible typewriter, reliable copy feedback and contact placeholder note.
- [x] Wire Vite production assets and legacy script without losing lower-section functionality. Verify original 14 checks plus new behavior checks and TypeScript production build.
- [x] Start local preview on the existing 4173 URL, confirm HTTP response, hand off updated page. No unrequested browser UI QA or publication.

## Decisions

- Reuse the existing static lower sections (React islands) instead of rewriting working content merely to change the stack.
- No git branching/worktree operation: existing repository has no commits and its metadata is read-only. Preserve all original untracked content in place.
- Reference video remains external as specified; a local reference copy/poster may be used to make preview reliable if needed, explicitly labeled as demo material.

## Verification record

- 2026-09-02: TypeScript check, Vite production build and all 18 tests passed.
- Production asset contract failed for the deduplicated HALO image before the fix, then passed for all four project image paths and resume.txt.
- HTTP 200 for the local homepage, TSX entry, hero module, stylesheet and resume. Desktop-app preview opening was queued, not visually verified.
- Read-only review found a short-mobile-height menu issue; fixed with header-safe padding, overflow scrolling and nonshrinking navigation content.
- No browser layout/interaction QA was requested or performed. No deployment or git metadata changes.
