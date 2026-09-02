# Tovila Water Rebuild

Build Phase 1 of the Tovila Water Solutions site — 10 pages. This is a rebuild on a new
sitemap; if you have an earlier Tovila project open, treat this as replacing it, not
extending it.

═══════════════════════════════════════════════════════════
NON-NEGOTIABLE TECHNICAL CONSTRAINT
═══════════════════════════════════════════════════════════
Output PLAIN HTML, CSS, and VANILLA JAVASCRIPT ONLY. No React, Vue, TypeScript, JSX, or
any framework. No build step. Separate static files: index.html, residential.html,
commercial.html, industrial.html, services.html, training.html, projects.html, csr.html,
about.html, contact.html — one shared css/style.css, one shared js/main.js. Semantic
HTML5 only. State a clear confirmation at the top of your response if any part required
a framework despite this instruction.

═══════════════════════════════════════════════════════════
DESIGN SYSTEM
═══════════════════════════════════════════════════════════
Colors:
  --ink:#081226  --ink-2:#05090f  --deep-blue:#0e3a5f  --mid-blue:#175a83
  --brand-red:#9c2236  --red-2:#7c1a2a  --red-bright:#c73a4c
  --pale:#f2f3ee  --paper:#faf9f5  --mist:#6e859c  --line-light:rgba(8,18,38,0.12)
  --home-tint:#4f9fc9 (Residential accent — light tint of the core blue)
Pillar color mapping — no new hues, just different weights of the same two brand colors:
  Residential = --home-tint · Commercial = --mid-blue · Industrial & Institutional =
  --deep-blue · Training = --brand-red / --red-bright
Fonts: 'Fraunces' (display headlines, 600-700), 'Archivo' (body/UI), 'IBM Plex Mono'
(eyebrows, labels, stats, form microcopy, uppercase, letter-spacing .12em)
Motion (respect prefers-reduced-motion — disable all of it, show final states instantly):
  scroll-progress bar top of viewport filling in --red-bright, SVG wave dividers between
  sections, liquid button hover (radial clip-path fill), droplet card hover reveal,
  staggered scroll reveals via IntersectionObserver

═══════════════════════════════════════════════════════════
CONVERSION PSYCHOLOGY — GLOBAL RULES
═══════════════════════════════════════════════════════════
Apply these to every form, quiz, and multi-step flow on the site, not just the ones
called out explicitly below:

1. SMART DEFAULTS — No field starts blank if a sensible default exists. Pre-select the
   most common answer (marked visually as a default, e.g. a subtly pre-checked radio or
   pre-filled dropdown) so the user's task becomes "confirm or adjust" instead of "fill
   in from nothing."

2. GOAL GRADIENT — No multi-step flow starts at 0%. If the user arrived via a choice
   they already made (e.g. clicking "My Home" on the homepage), that choice counts as
   step 1 already complete. Implement with localStorage: when a user clicks an entry
   card on the homepage (residential/commercial/industrial/training), store it as
   `localStorage.setItem('tovila_entry', '<segment>')`. The destination page's form/quiz
   reads this on load and initializes its progress bar accordingly (e.g. "Step 2 of 4"
   already showing ~25-40% fill, with step 1 shown as a completed checkmark: "✓ Home
   water solutions"), rather than starting the visible counter at 0.

3. RECIPROCITY — Before asking for contact details, give something free and immediately
   useful. Specifics below per page (instant diagnostic tips, free lesson preview,
   downloadable report).

4. IKEA / ENDOWMENT EFFECT — Where a "package" or "path" is being chosen, let the user
   assemble it through visible, interactive steps (toggling concerns, picking a starting
   point) so the result feels self-built before the CTA to request/apply appears.

5. LOSS AVERSION — Where the message is about maintenance, inaction, or system neglect,
   frame it around what's at risk (downtime, equipment damage, cost of failure) rather
   than only what's gained by acting.

6. CONTRAST EFFECT — Never show a price, fee, or cost figure in isolation. Anchor it
   against a larger, directly relevant number shown immediately before it, so the ask
   reads as small by comparison.

═══════════════════════════════════════════════════════════
SHARED NAV (all 10 pages)
═══════════════════════════════════════════════════════════
Logo (droplet mark + TOVILA / WATER SOLUTIONS wordmark). Flat links: Home, Projects, CSR,
About, Contact. Two dropdowns: "Solutions" (Residential, Commercial, Industrial &
Institutional, Services) and "Learn" (Training, Knowledge Centre — Knowledge Centre link
can 404/placeholder for now, it's Phase 3). Right side: "Request a Water Assessment"
button (--brand-red, liquid hover), prominent — this is the primary site-wide CTA,
replacing any "Request a Quote" language in the main nav. Mobile: hamburger → full-screen
overlay.

SHARED FOOTER: Brand block + social icons / Solutions links / Learn + Company links /
Newsletter signup. Contact details (exact): Tetegu Road, Tetegu, Accra, Ghana ·
+233 (0)55 249 0684 · info@tovilawatersolutions.com · Mon–Fri 8am–6pm, Sat 9am–1pm.

═══════════════════════════════════════════════════════════
PAGE 1 — HOME (index.html)
═══════════════════════════════════════════════════════════
1. Hero: H1 "Engineering Better Water for Homes, Businesses & Industry." Subhead:
   "Complete water treatment, purification and water engineering solutions designed
   around your water source, application and budget." Primary CTA "Request a Water
   Assessment", secondary "Find Your Water Solution". Strip beneath: Residential •
   Commercial • Industrial • Institutional • Training.
2. "What Water Challenge Are You Facing?" — 5 cards: My Home Needs Better Water / My
   Business Needs a Solution / I Need an Industrial System / My Existing System Has a
   Problem / I Want to Learn Water Engineering. Each card click sets the
   `tovila_entry` localStorage value (see Goal Gradient rule above) and navigates to
   the matching page.
3. Residential teaser (--home-tint accent) → links to residential.html
4. Commercial teaser (--mid-blue accent) → links to commercial.html
5. Industrial & Institutional teaser (--deep-blue accent) → links to industrial.html
6. "Our Engineering Process" — short 4-step strip (Assess → Design → Install →
   Maintain)
7. Featured Projects teaser — lead card is Ashesi University [placeholder copy, flag
   clearly as pending real project details], 2 more placeholder project cards → links
   to projects.html
8. Community Impact / CSR teaser (--brand-red accent) → links to csr.html
9. Technical Support & Rehabilitation strip → links to services.html
10. Tovila Water Engineering Academy teaser (--brand-red accent) → links to
    training.html
11. "Why Tovila" — 3-4 differentiator cards
12. Closing CTA band: "Request a Water Assessment" — this is the same multi-step form
    used sitewide (see Contact page spec), embedded or linked

═══════════════════════════════════════════════════════════
PAGE 2 — RESIDENTIAL (residential.html)
═══════════════════════════════════════════════════════════
1. Banner (--home-tint accent gradient): H1 "Better Water Starts at Home." Explain
   water source variability first (borehole / municipal / tank / mixed) before any
   product talk.
2. Solutions grid: Whole-House Filtration, Whole-House Softening, Home RO Systems, UV
   Disinfection, Borehole Water Treatment — icon, description, "Learn More" per card
3. RECIPROCITY FLOW — "Test My Water" instant diagnostic (before any contact form):
   A 3-question quiz ("What does your water look/taste/feel like?" — sediment/cloudy,
   bad taste or odour, hard water spots, none of these) that on submit immediately
   shows 2-3 free, specific tips based on the answer (no email required yet) — e.g.
   selecting "hard water spots" instantly shows a short explainer on what's likely
   happening and why. ONLY after showing this free value does a card appear: "Want a
   full professional assessment of your water?" → opens the booking form.
4. IKEA EFFECT — Package builder: an interactive card grid where the user toggles
   concerns (Sediment / Taste & Odour / Hard Water / Drinking Water Quality /
   Microbiological Safety). As they toggle, a "Your Recommended Package" panel visually
   assembles component icons in real time (e.g. selecting Hard Water + Drinking Water
   Quality shows a softener icon + RO icon slot into a summary card). Below it, show
   all 5 tiers (Essential/Premium/Pure Drinking Water/Complete Home/Luxury Home) as
   cards.
5. CONTRAST EFFECT on the package tiers: display Luxury Home (the top/most complete
   tier) first or with visual emphasis (larger card, "Most Complete" tag) so Essential
   through Complete Home read as proportionately reasonable by comparison, not as the
   default anchor.
6. Booking form (triggered from step 3 or directly): multi-step, GOAL GRADIENT applied
   — if `tovila_entry === 'residential'` is set, open at step 2 of 3 already, with step
   1 shown as a completed checkmark ("✓ Told us about your home"). SMART DEFAULTS:
   "Preferred contact time" pre-set to "Weekday afternoon" (adjustable), "Water source"
   pre-set to "Borehole" (adjustable) — mark both as pre-filled, not blank.

═══════════════════════════════════════════════════════════
PAGE 3 — COMMERCIAL (commercial.html)
═══════════════════════════════════════════════════════════
1. Banner (--mid-blue accent): H1 "Water Solutions That Keep Your Business Running."
   Copy angle: reliability, consistency, cost control, equipment protection,
   operational continuity — not just "clean water."
2. Segment grid (7 cards): Hotels & Resorts, Restaurants, Offices, Apartments &
   Estates, Schools, Hospitals & Clinics, Laundries — each with its application
   bullets (guest water/laundry/kitchen/pools for hotels, etc. — see master plan for
   full lists per segment)
3. CONTRAST EFFECT + LOSS AVERSION lead-in to the assessment CTA: a short stat block
   framed around the cost of an equipment failure or unplanned shutdown from untreated
   water [placeholder figure, flag clearly] shown immediately above the assessment
   CTA, so the ask ("book a free assessment") reads as small next to what's at risk.
4. Commercial Water Assessment form — multi-step, GOAL GRADIENT (same localStorage
   pattern, opens further along if `tovila_entry === 'commercial'`). Fields: Water
   source (Borehole/Municipal/Tank/Other — SMART DEFAULT: pre-select "Borehole"),
   Business type (Hotel/Restaurant/Office/School/Hospital/Estate/Other), Current
   problem (Hardness/Colour/Odour/TDS/Iron/Manganese/Pressure/Other), Estimated daily
   consumption, Location, Upload water analysis (optional file field).

═══════════════════════════════════════════════════════════
PAGE 4 — INDUSTRIAL & INSTITUTIONAL (industrial.html)
═══════════════════════════════════════════════════════════
1. Banner (--deep-blue accent): H1 "Engineered Water for Complex Applications." Keep
   tone technical/credible — this audience wants engineering depth, not warmth.
2. Services grid: Industrial RO, Water Treatment Plants, Process Water, Wastewater,
   Water Reuse, Automation & PLC, Institutional Water Systems
3. LOSS AVERSION section: "The Cost of Neglected Systems" — frame maintenance and
   rehabilitation around downtime cost, equipment degradation, and compliance risk
   from deferred maintenance, not just the benefits of a service contract
   [placeholder figures, flag clearly]
4. Featured case: Ashesi University — showcase card, flagged placeholder pending real
   scope/results
5. CTA: "Talk to Our Engineering Team" → contact.html with Subject pre-set to
   "Technical Support"

═══════════════════════════════════════════════════════════
PAGE 5 — SERVICES (services.html)
═══════════════════════════════════════════════════════════
Cross-cutting technical services for people who already know what they need: Water
Analysis, System Design, Installation, Commissioning, Maintenance, Technical Support,
RO Rehabilitation, Borehole Services, Consultancy. Sliding filter-pill bar (All /
Design & Install / Maintenance & Support / Consultancy), same liquid-morph interaction
pattern as elsewhere on the site.

═══════════════════════════════════════════════════════════
PAGE 6 — TRAINING (training.html) — Tovila Water Engineering Academy
═══════════════════════════════════════════════════════════
1. Banner (--brand-red accent): "Tovila Water Engineering Academy — Learn. Practise.
   Engineer."
2. RECIPROCITY: "Watch Lesson 1 Free" — an embedded/placeholder intro video block
   (e.g. "Introduction to Water Treatment") available with no signup, positioned
   prominently before any enrollment ask
3. Four programme cards: Apprenticeship, Online Courses, Hands-On RO Training,
   Advanced RO Training — icon, audience, structure, CTA each
4. IKEA EFFECT: "Build Your Learning Path" — an interactive 5-step selector (Beginner
   → Foundation → Practical → Professional → Specialist) where the user picks their
   starting point and the path visually highlights/connects forward from there before
   showing "Start This Path" CTA
5. Training pathway diagram (visual, same 5 stages)
6. Closing CTA: "Build Your Career in Water Engineering" → Apply Now (GOAL GRADIENT:
   application form opens further along if `tovila_entry === 'training'`)

═══════════════════════════════════════════════════════════
PAGE 7 — PROJECTS (projects.html)
═══════════════════════════════════════════════════════════
Filter by pillar (All / Residential / Commercial / Industrial / Institutional), same
sliding-pill pattern. Lead card: Ashesi University [flag placeholder]. Remaining cards
reuse the earlier placeholder set (Tetegu Community Borehole Network, Industrial Water
Treatment Retrofit, Regional Training Hub) — all flagged pending real case data.

═══════════════════════════════════════════════════════════
PAGE 8 — CSR (csr.html)
═══════════════════════════════════════════════════════════
Banner "Water Is a Right, Not a Privilege." Impact stats band [placeholder]. Three
programme cards: Community Water Access, Technician Scholarships, School Water
Projects. RECIPROCITY: "Download Our Impact Report" (placeholder PDF link) offered
before the "Partner With Us" CTA, not after.

═══════════════════════════════════════════════════════════
PAGE 9 — ABOUT (about.html)
═══════════════════════════════════════════════════════════
Our Story (this is where the Ghana-origin, pan-African-ambition narrative lives now) /
Our Team (placeholder profile cards, flagged pending real bios/photos) / Our Expertise
/ Partners.

═══════════════════════════════════════════════════════════
PAGE 10 — CONTACT (contact.html)
═══════════════════════════════════════════════════════════
Four distinct entry points as tabs or cards, not one generic form: Request Assessment
(routes to the relevant residential/commercial multi-step form), Request Quote,
Technical Support, Training Enquiry. SMART DEFAULT: Subject field pre-selects based on
`tovila_entry` localStorage value if present (e.g. arriving from the Training page
pre-selects "Training Enquiry"), otherwise defaults to "General Enquiry" — never blank.

═══════════════════════════════════════════════════════════
FINAL REQUIREMENTS
═══════════════════════════════════════════════════════════
- Fully responsive, nav collapses to hamburger under 900px, grids collapse to 1-2
  columns under 768px
- Keyboard-accessible, visible focus rings in --red-bright
- prefers-reduced-motion disables all animation and shows end states immediately
- All forms are front-end only for now (no real backend) — note in a code comment
  wherever a form would need a real submission endpoint wired in later

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4f51ce28-8c7e-48b7-8ae6-b012db9ca365).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
