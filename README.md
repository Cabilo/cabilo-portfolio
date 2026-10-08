# CABILO Portfolio

CABILO's portfolio and learning site, built with Astro and a content-driven architecture designed for visual work, project breakdowns, tutorials, and flexible media presentations.

## Stack

- **Astro 7.3.5**
- **Tailwind CSS 4.3.3**
- **Decap CMS** with the Turbo-GitHub backend
- **Node.js >= 22.12.0**
- **Vercel** deployment
- Astro Content Collections for Projects, Learning, Pages, Tags, and Software

## Development

Run from the repository root:

```sh
npm install
npm run dev
npm run build
npm run preview
```

The production build is static and outputs to `dist/`.

Before pushing structural changes, also run:

```sh
git diff --check
```

---

# Content Architecture

CABILO separates **content data** from **rendering**.

Projects and Learning documents live in content collections and describe what should appear. Astro components decide how that content is rendered.

The goal is to avoid copying rendering logic between Projects, Tutorials, and Breakdowns.

## Projects

Projects are rendered through:

`src/pages/projects/[id].astro`

## Learning

Learning content is stored in one collection and exposed through separate routes:

- `src/pages/tutorials/`
- `src/pages/breakdowns/`

Tutorials and Breakdowns currently share very similar page structures. That duplication is a known future DRY opportunity, but it should not be refactored casually while working on unrelated layout or CMS changes.

---

# Media Block System

## MediaBlocksRenderer (Legacy)

`src/components/MediaBlocksRenderer.astro` is the master media rendering engine.

It is intentionally shared by:

- Projects
- Tutorials
- Breakdowns

Supported media block types include:

- Text Block
- Image
- Video
- Turntable
- AOV
- Media Group

The important rule is:

> If a media type needs new rendering behavior, prefer changing the shared renderer rather than implementing a second version inside a page.

This is the CABILO equivalent of a reusable material function: define the behavior once and feed it different content.

## Video parsing

`src/lib/video.ts` contains the shared video URL parsing logic.

YouTube, Vimeo, and direct video URLs should not be parsed independently by each page or component.

## Media Groups

Media Groups are layout wrappers around existing media blocks.

A group can contain mixed content:

- Image
- Video
- AOV
- Turntable
- Text Block

Groups support:

- 1–5 columns
- 1–5 items
- mixed media
- responsive stacking

Nested Media Groups are intentionally not supported.

This keeps the CMS predictable and prevents recursive layout structures such as Group → Group → Group.

A one-column group should remain a safe vertical presentation and should not force existing media content into a different visual treatment.

## Media Group playground

`src/content/learning/media-group-playground.md` is a temporary test page for the Media Group system.

It is intentionally not featured. It can be removed after the layout system has been fully evaluated.

---

# Experimental Layout Blocks

CABILO now has an experimental **Layout Blocks** system alongside the existing Media Blocks system.

This is intentionally additive while it is being tested.

## Layout Blocks mental model

> **Media Blocks describe what the content is. Layout Blocks describe where and how that content occupies space.**

The experimental layout editor uses a conceptual matrix of:

**∞ rows × 5 columns**

The current practical editor limit is 50 rows.

Internally, each column and row can be divided into half-units. This allows compositions such as:

- 1.5 columns + 3.5 columns
- 2 columns + 3 columns
- half-row offsets and heights

The grid itself is invisible to the public website. It is a composition system, not visible page decoration.

## Layout Block snapping

Each block has a snapping mode:

- **Constrained:** edges snap to the full ∞ × 5 grid units.
- **Free:** edges snap to half-column and half-row units.

Both modes allow blocks to be dragged and resized. The difference is only the snapping resolution.

This gives the editor freedom without falling back to arbitrary pixel positioning.

Current experimental content types are **Image, Text, Video, Turntable, and AOV**. Turntables still expect a real frame folder under `public/`; missing test folders are intentionally reported as empty rather than fabricated.

## Layout Block asset fit

Each Layout Block has one **Asset Fit** mode:

- **None** — the media fills the authored block slot.
- **Width → Height** — the block's available width is authoritative and the media height follows the asset's natural aspect ratio.
- **Height → Width** — the block's available height is authoritative and the media width follows the asset's natural aspect ratio.

This is intentionally a single three-state value rather than separate aspect-ratio and direction switches. CSS `aspect-ratio` performs the proportional sizing after the renderer discovers the asset's intrinsic ratio.

The custom CMS widget also converts Decap's incoming field value into plain JavaScript data before editing it. This is important because Layout Blocks must survive a CMS refresh, not only exist in the widget's temporary UI state.

## CMS implementation

The experimental Decap widget lives in:

`public/admin/layout-blocks.js`

The public renderer lives in:

`src/components/LayoutBlocksRenderer.astro`

Projects and Learning use the production `layoutBlocks` field. The former `mediaBlocks` system is retained only as legacy reference code.

This system is experimental. It should be evaluated for authoring experience, responsive behavior, collision/spacing rules, and media-library integration before it replaces or absorbs any part of the existing Media Block architecture.

# Responsive Width System

CABILO uses **semantic content widths** instead of one universal page container.

This is an important design decision.

The desktop portfolio should take advantage of large monitors. Visual media should not become smaller merely because a page happens to also contain text.

At the same time, paragraphs should remain comfortable to read.

## Width tokens

The shared width system lives in:

`src/styles/global.css`

Current desktop-oriented values:

- **Reading:** approximately 900px maximum
- **Media:** approximately 92vw
- **Wide:** approximately 96vw
- **Desktop page gutter:** approximately 4vw
- **Mobile page gutter:** approximately 5vw

These are tokens/concepts rather than numbers that should be repeatedly hard-coded into individual components.

## Reading width

Use the reading width for:

- Article paragraphs
- Project descriptions
- Learning introductions
- Metadata
- Long-form text

The purpose is readability.

## Media width

Use the media width for:

- Project imagery
- Videos
- Turntables
- AOVs
- Media Groups
- Large visual comparisons

The purpose is visual scale and better use of desktop real estate.

## Wide width

Use the wide width for intentionally immersive presentation surfaces.

This is also the intended width concept for future presentation-style experiences such as **DragDeck**.

## Width mapping rule

There are two separate decisions:

1. **Define responsive width tokens** — establish what CABILO means by Reading, Media, and Wide.
2. **Map widths to layout components** — decide which content belongs to each semantic width.

These are complementary, not competing options.

Pages should choose the semantic layout. Components should not invent a new page-width system unless there is a deliberate reason.

---

# Desktop vs Mobile

A core design rule is:

> Mobile is not desktop made smaller.

Desktop layouts should take advantage of horizontal screen space when the content benefits from it.

For example, a three-column Media Group should be able to look like:

`Image | Image | Text`

at a substantial desktop scale.

On a phone, the same content should naturally become a vertical sequence rather than forcing tiny columns or horizontal overflow.

The goal is for mobile/tablet layouts to be **designed for their available space**, not merely to survive a desktop composition.

This rule exists specifically to prevent desktop layout improvements from creating poor mobile experiences.

---

# Page Layout Philosophy

The page itself provides the available canvas.

Content inside that page then chooses the appropriate semantic width.

Conceptually:

```text
Page
├── Reading content
│   ├── Heading
│   ├── Description
│   └── Prose
│
├── Media content
│   ├── Image
│   ├── Video
│   ├── AOV
│   ├── Turntable
│   └── Media Group
│
└── Wide presentation
    └── Future DragDeck
```

This is preferable to placing the entire page inside a narrow `max-width` and then trying to make media compensate for the restriction.

---

# Taxonomy

`src/lib/taxonomy.ts` provides shared taxonomy normalization.

Tags and software should have one consistent source of truth so that values can safely be used in URLs and collection relationships.

Do not duplicate slugification logic inside individual pages.

## Software Pool

The Software Pool contains the available software taxonomy.

Each software entry has:

- `name`
- `addToArsenal`

`addToArsenal` controls whether that software is displayed in the public Arsenal on the About page.

This intentionally separates:

> software that is valid for content taxonomy

from:

> software that deserves to be displayed in the public Arsenal.

A software entry can therefore remain available for project metadata without making the Arsenal unnecessarily large.

---

# Thumbnail System

Thumbnails are a separate presentation system from Media Blocks.

Relevant files include:

- `src/components/Thumbnail.astro`
- `public/admin/thumbnail-crop.js`
- `thumbnailCrop` content data

Thumbnail cropping exists primarily for cards and portfolio listings.

Do not merge thumbnail behavior into the Media Block image renderer without a clear reason. A card thumbnail and a project media image have different visual responsibilities.

---

# CMS Architecture

Decap CMS is configured in:

`public/admin/config.yml`

The CMS should expose the content model without turning into a general-purpose page builder.

Important constraints such as:

- Media Group maximum columns
- Media Group maximum items
- no nested Media Groups
- software Arsenal visibility

are intentional safeguards for maintainability and authoring clarity.

The CMS configuration may contain some repeated Media Block definitions between collections. This is a known area for possible future DRY improvements, but changes should be conservative because the CMS configuration is part of the working production system.

---

# Navigation and Shared UI

Global site structure is handled through:

- `src/layouts/Layout.astro`
- `src/components/Navbar.astro`
- `src/components/Footer.astro`

The Navbar has desktop, mobile, and iPad-specific interaction behavior.

Because those interactions have previously required careful fixes, unrelated layout or CMS changes should not casually modify Navbar behavior.

---

# Future: DragDeck

**DragDeck** is the planned reusable presentation interaction discussed for the site.

The intended interaction is a horizontal, drag-driven presentation:

- the current panel moves toward the left
- the next panel enters from the right
- dragging controls the transition
- the cursor becomes a circular **DRAG** indicator over the interactive area

The feature should eventually be implemented as a reusable component rather than being hard-coded into a single Project or Learning page.

The intended mental model is a physical presentation deck rather than a conventional carousel.

It should be usable by different page types when appropriate.

It is **not part of the current width-system implementation**.

---

# Architecture Rules

When making future changes, prefer these rules:

1. **One rendering rule, one implementation.** Reuse shared components and utilities.
2. **Keep content data separate from presentation logic.**
3. **Prefer semantic layout widths over arbitrary max-width values.**
4. **Desktop may use substantially more horizontal space for visual work.**
5. **Mobile/tablet must remain intentionally usable and should not inherit desktop compositions blindly.**
6. **Do not solve a parent-layout problem inside a child component.** If a page canvas is too narrow, fix the page layout rather than shrinking or distorting the media renderer.
7. **Do not add recursive CMS structures unless there is a strong reason.**
8. **Avoid unrelated refactors while fixing a specific architectural problem.**
9. **Preserve known-working Project media behavior when extending the system to Learning.**
10. **Prefer reversible, focused changes over large speculative rewrites.**

---

# Known Future Opportunities

These are observations, not instructions to refactor immediately:

- Tutorials and Breakdowns have highly similar detail-page templates and could eventually share a layout component.
- Decap Media Block definitions contain repeated configuration and could eventually be DRYed up.
- The new semantic width system can eventually be extended to additional presentation components.
- DragDeck can become a reusable presentation layer once the interaction is implemented and tested.

These should be handled separately from unrelated feature work.

---

# Deployment and Change Discipline

CABILO is deployed through Vercel, so unnecessary commits can consume deployment capacity.

Prefer:

- fewer, meaningful commits
- grouped changes that belong to one feature
- local/build validation before pushing when possible
- a clear commit boundary before risky architectural changes

For risky work, establish a known-good commit before making the change so the change remains easy to revert.

---

# Important Safety Principle

A working implementation is valuable, but **working does not automatically mean architecturally correct**.

When extending the system:

1. Identify the underlying design goal.
2. Check whether the current architecture supports that goal.
3. Fix the correct layer.
4. Preserve existing behavior where it is still intentional.
5. Avoid adding compensating hacks in child components.

The goal is a portfolio system that stays flexible as CABILO adds more projects, breakdowns, tutorials, media types, and interactive presentation features.


---

# Post Bilingual Check

This section records the health-audit items identified after the bilingual EN/PT-BR implementation and the Vercel deployment/cache incident. These are reminders for future maintenance, not instructions to refactor immediately.

## Known-good checkpoint

Current confirmed working production checkpoint:

- Commit: `1c95bdb8eac220f32903387a1ee354502cbe85e0`
- Message: `fix: remove custom browser language redirect`
- Production required a Vercel cache purge before the current CSS/assets loaded correctly.
- Treat this commit as a rollback/safety point before risky future work.

## Health-audit follow-ups

1. **Navbar mobile hamburger** — currently broken on mobile after the latest changes. Audit and fix separately; do not mix this with unrelated architecture work.
2. **LanguageSwitcher architecture** — currently working, but the language preference mechanism should eventually be reviewed so URL state is the authoritative source and unnecessary lifecycle/localStorage complexity is avoided.
3. **Navbar lifecycle code** — review remaining `astro:page-load` / `astro:after-swap` handling now that `ClientRouter` has been removed. Do not change casually because Navbar desktop/mobile/iPad behavior has previously required several fixes.
4. **Experimental Layout Block test content** — decide later which playground/test pages and test project entries should remain, be hidden, or be removed once Layout Blocks are considered stable.
5. **Decap CMS repeated definitions** — consider a conservative DRY improvement later; do not refactor while working on unrelated features.
6. **Tutorials/Breakdowns page duplication** — possible future shared detail-page component; leave untouched until there is a dedicated refactor pass.
7. **Temporary test/deployment artifacts** — keep the repository free of one-off deployment trigger files after they are no longer needed.

## ArtStation migration rule

Before attempting the ArtStation migration again, start from this known-good checkpoint and add the imported project assets/content as a separate, controlled change. Do not combine the migration with unrelated cleanup or architecture changes.
