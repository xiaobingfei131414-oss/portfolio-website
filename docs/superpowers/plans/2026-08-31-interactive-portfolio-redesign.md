# Interactive Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing static portfolio into a bold, unified, pointer- and scroll-responsive experience inspired by Lusion's interaction principles.

**Architecture:** Keep the existing semantic single-page document and progressively enhance it with CSS transforms and one JavaScript initialization path. Pure math helpers remain exportable for Node tests; DOM effects are guarded by device capability and reduced-motion preferences.

**Tech Stack:** HTML5, CSS, browser JavaScript, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-31-interactive-portfolio-redesign.md`

## Global Constraints

- No WebGL, runtime framework, animation library, or new dependency.
- Use electric blue `#3147ff`, acid green `#c8ff28`, warm white `#f2f0e9`, and near-black `#11120f`.
- Preserve project filtering, case dialog, mobile navigation, resume download, and contact actions.
- Disable cursor, magnetic, tilt, parallax, smooth scrolling, and complex transitions for reduced-motion users.
- Disable cursor, magnetic, and 3D tilt on coarse-pointer/mobile devices.
- Do not fabricate projects, clients, performance data, or employment details.

---

### Task 1: Motion primitives

**Files:**
- Modify: `test/site.test.js`
- Modify: `script.js`

**Interfaces:**
- Produces: `clamp(value, min, max): number`, `pointerOffset(pointer, center, limit): number`, `progress(value, max): number`.
- Existing exports remain unchanged.

- [ ] **Step 1: Write failing unit tests**

```js
test('motion helpers clamp pointer and scroll values', () => {
  const { clamp, pointerOffset, progress } = require('../script.js');
  assert.equal(clamp(12, 0, 10), 10);
  assert.equal(pointerOffset(120, 100, 8), 8);
  assert.equal(pointerOffset(90, 100, 8), -8);
  assert.equal(progress(250, 1000), .25);
  assert.equal(progress(10, 0), 0);
});
```

- [ ] **Step 2: Verify the test fails**

Run: `node --test`
Expected: FAIL because the three helpers are not exported.

- [ ] **Step 3: Implement the pure helpers**

```js
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pointerOffset(pointer, center, limit) {
  return clamp(pointer - center, -limit, limit);
}

function progress(value, max) {
  return max > 0 ? clamp(value / max, 0, 1) : 0;
}
```

- [ ] **Step 4: Export the helpers and run tests**

Run: `node --test`
Expected: all tests pass.

### Task 2: Semantic interaction hooks

**Files:**
- Modify: `test/site.test.js`
- Modify: `index.html`

**Interfaces:**
- Produces: `.cursor`, `.scroll-progress`, `.page-transition`, `[data-reveal]`, `[data-magnetic]`, `[data-tilt]`, `.motion-track`, and `.archive-track` hooks consumed by CSS and JavaScript.

- [ ] **Step 1: Add a failing structure test**

```js
test('page exposes the interactive redesign hooks', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  for (const hook of ['cursor', 'scroll-progress', 'page-transition', 'archive-track', 'motion-track']) {
    assert.match(html, new RegExp(hook));
  }
  assert.match(html, /data-reveal/);
  assert.match(html, /data-magnetic/);
  assert.match(html, /data-tilt/);
});
```

- [ ] **Step 2: Verify the test fails**

Run: `node --test`
Expected: FAIL because interaction hooks are absent.

- [ ] **Step 3: Add minimum semantic hooks**

Add the three global feedback elements after the opening `body`, interaction data attributes to existing controls and visual frames, a two-row motion track before the capability list, and `archive-track` to the existing archive grid. Keep all current content and accessible names.

- [ ] **Step 4: Run tests**

Run: `node --test`
Expected: all tests pass.

### Task 3: Unified visual and motion system

**Files:**
- Modify: `test/site.test.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: Task 2 hooks and existing section classes.
- Produces: electric-blue hero, floating pill navigation, custom cursor states, reveal states, tilt variables, draggable archive, green contact panel, mobile fallbacks.

- [ ] **Step 1: Add a failing stylesheet contract test**

```js
test('stylesheet defines the redesign palette and motion hooks', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  for (const pattern of ['#3147ff', '.cursor', '.scroll-progress', '.is-revealed', '.archive-track', '--tilt-x', '--tilt-y']) {
    assert.match(css, new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(css, /pointer:\s*coarse/);
});
```

- [ ] **Step 2: Verify the test fails**

Run: `node --test`
Expected: FAIL because the palette and motion hooks are absent.

- [ ] **Step 3: Implement the redesign styles**

Append a clearly delimited redesign layer to `styles.css` so the existing responsive foundation remains intact. Use only opacity and transforms for animated state; set `will-change` only on cursor, tilt, and track elements. Add explicit coarse-pointer and reduced-motion overrides.

- [ ] **Step 4: Run tests**

Run: `node --test`
Expected: all tests pass.

### Task 4: Progressive interaction controller

**Files:**
- Modify: `test/site.test.js`
- Modify: `script.js`

**Interfaces:**
- Consumes: Task 1 helpers and Task 2 DOM hooks.
- Produces: cursor tracking, magnetic buttons, reveal observer, scroll progress and tracks, pointer tilt, click ripples, draggable archive, compact-header state, and case-opening transition.

- [ ] **Step 1: Add a failing source contract test**

```js
test('interaction controller uses progressive browser APIs', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
  assert.match(source, /IntersectionObserver/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /matchMedia\('\(pointer: fine\)'\)/);
  assert.match(source, /setPointerCapture/);
});
```

- [ ] **Step 2: Verify the test fails**

Run: `node --test`
Expected: FAIL because the interaction controller is absent.

- [ ] **Step 3: Implement one guarded initializer**

Extend `initSite()` with small local handlers. Gate fine-pointer behavior behind `matchMedia('(pointer: fine)')` and all nonessential motion behind `!matchMedia('(prefers-reduced-motion: reduce)').matches`. Use one rAF loop for scroll-derived CSS variables and direct pointer transforms for the limited number of hovered elements.

- [ ] **Step 4: Preserve existing behavior and run tests**

Run: `node --test`
Expected: all tests pass, including filtering and case navigation.

### Task 5: Browser verification

**Files:**
- Verify: `index.html`, `styles.css`, `script.js`

**Interfaces:**
- Consumes: completed redesign.
- Produces: evidence for desktop, mobile, keyboard, and reduced-motion acceptance.

- [ ] **Step 1: Run the complete automated suite**

Run: `node --test`
Expected: all tests pass with zero warnings.

- [ ] **Step 2: Verify desktop interactions at 1280×800**

Confirm cursor expansion, magnetic buttons, hero depth, card tilt, filter reflow, case transition, archive drag, and scroll progress. Confirm browser console has no errors.

- [ ] **Step 3: Verify mobile at 390×844**

Confirm no page-level horizontal overflow, mobile menu works, archive remains touch-scrollable, and cursor/tilt are disabled.

- [ ] **Step 4: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce`; confirm all content is visible and filtering, dialog, navigation, downloads, and links remain functional.
