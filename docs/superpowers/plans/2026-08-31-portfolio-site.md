# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, responsive Chinese portfolio site for an e-commerce 3D visual designer.

**Architecture:** Use one semantic HTML document, one stylesheet, and one small JavaScript module. Content stays data-driven only where interaction needs it: project filtering, case-dialog content, navigation state, and audio-toggle UI.

**Tech Stack:** HTML5, CSS, browser JavaScript, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-31-portfolio-site-design.md`

## Global Constraints

- No runtime framework or third-party dependency.
- Chinese-first copy with concise English labels.
- Product animation remains the dominant content.
- Generated visuals are labeled examples and must not be presented as the user's real client work.
- Responsive, keyboard accessible, reduced-motion aware.

---

### Task 1: Content contract and interactions

**Files:**
- Create: `test/site.test.js`
- Create: `script.js`

**Interfaces:**
- Produces: `filterProjects(category, projects)`, `getProject(id, projects)`, `nextProject(id, projects)`.

- [ ] Write Node tests for filtering, project lookup, and wraparound next-project behavior.
- [ ] Run `node --test` and confirm failure because `script.js` is absent.
- [ ] Implement the three pure functions and guarded DOM enhancement code.
- [ ] Run `node --test` and confirm all tests pass.

### Task 2: Semantic site content

**Files:**
- Create: `index.html`
- Create: `resume.txt`

**Interfaces:**
- Consumes: IDs and data attributes used by `script.js`.
- Produces: all navigation sections, filter controls, project cards, case dialog, and contact actions.

- [ ] Add a failing structural test asserting required landmark IDs and project metadata.
- [ ] Run `node --test` and confirm the structural test fails.
- [ ] Build the minimum semantic document and downloadable editable resume placeholder.
- [ ] Run `node --test` and confirm all tests pass.

### Task 3: Visual system and responsive behavior

**Files:**
- Create: `styles.css`
- Create: `assets/*.png`

**Interfaces:**
- Consumes: semantic classes from `index.html`.
- Produces: responsive layout, product-animation-first hierarchy, accessible focus states, dialog, and reduced-motion behavior.

- [ ] Add a failing stylesheet contract test for breakpoints, focus-visible, and prefers-reduced-motion.
- [ ] Run `node --test` and confirm failure because `styles.css` is absent.
- [ ] Generate clearly labeled example product visuals and implement the responsive CSS.
- [ ] Run `node --test` and confirm all tests pass.

### Task 4: Final verification

**Files:**
- Verify: `index.html`, `styles.css`, `script.js`, `assets/*`

- [ ] Run `node --test`.
- [ ] Serve locally and verify the page in desktop and mobile widths.
- [ ] Check navigation, filters, dialog, keyboard focus, audio UI, and downloads.
- [ ] Review copy for fabricated claims and placeholder clarity.

