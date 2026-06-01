# DESIGN.md — TryggKontakt

The design source of truth. Open this file mid-work to answer concrete questions: *what color is this, what size, what radius, how do we phrase this empty state, what does this screen look like*. If you find yourself reading it for inspiration, you've come to the wrong file — that's `PROJECT.md`.

**Conventions.** Documentation and tokens in English. All user-facing copy in Swedish, examples included. Never invert this.

**Stack assumed.** Next.js App Router, Tailwind, shadcn/ui, Lucide icons. The Tailwind config that implements every token below is in the appendix.

---

## Contents

1. [Principles that drive decisions](#1-principles-that-drive-decisions)
2. [Color](#2-color)
3. [Typography](#3-typography)
4. [Spacing and layout](#4-spacing-and-layout)
5. [Radius and elevation](#5-radius-and-elevation)
6. [Motion](#6-motion)
7. [Iconography](#7-iconography)
8. [Components](#8-components)
9. [Screen patterns](#9-screen-patterns)
10. [Voice and tone (Swedish)](#10-voice-and-tone-swedish)
11. [Email design](#11-email-design)
12. [PWA and app assets](#12-pwa-and-app-assets)
13. [Onboarding copy](#13-onboarding-copy)
14. [Accessibility — concrete and testable](#14-accessibility--concrete-and-testable)
15. [Performance budgets (design-related)](#15-performance-budgets-design-related)
16. [What we do not have](#16-what-we-do-not-have)
17. [Decision log](#17-decision-log)
18. [Ship checklist](#18-ship-checklist)
19. [Appendix: Tailwind config](#19-appendix-tailwind-config)

---

## 1. Principles that drive decisions

Five principles. Each one has been used to reject something concrete. If a principle hasn't killed at least one feature or pattern, delete it.

1. **One primary action per screen.** If a screen has two equally weighted CTAs, the screen is wrong, not the button styling.
2. **Calm over clever.** Microinteractions, surprise, delight — these belong in apps people choose to open for fun. This is opened by an exhausted parent at 7:14 in the morning.
3. **Type and contrast before color.** A reader who can't comfortably parse the text doesn't care about the palette. AAA contrast and 17 px body are floor, not ceiling.
4. **Predictable beats efficient.** A button in the same place every time is more valuable than a button two taps faster.
5. **Less, slowly.** Removing something is a design move. Adding something is design debt.

---

## 2. Color

All tokens live as CSS variables in `globals.css`. Tailwind maps them to semantic names. **Never** put raw hex in components.

### Light mode (default and only)

<svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;background:#FAF8F4;border-radius:12px;">
  <rect x="20" y="20" width="80" height="80" rx="12" fill="#FAF8F4" stroke="#E8E3D8"/>
  <rect x="110" y="20" width="80" height="80" rx="12" fill="#FFFFFF" stroke="#E8E3D8"/>
  <rect x="200" y="20" width="80" height="80" rx="12" fill="#F4F1EB" stroke="#E8E3D8"/>
  <rect x="290" y="20" width="80" height="80" rx="12" fill="#E8E3D8"/>
  <rect x="380" y="20" width="80" height="80" rx="12" fill="#C9C2B0"/>
  <rect x="470" y="20" width="80" height="80" rx="12" fill="#3F7A6E"/>
  <rect x="560" y="20" width="80" height="80" rx="12" fill="#E3EEEB"/>
  <text x="60" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">bg</text>
  <text x="150" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">surface</text>
  <text x="240" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">sunken</text>
  <text x="330" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">border</text>
  <text x="420" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">border-strong</text>
  <text x="510" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">primary</text>
  <text x="600" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">primary-soft</text>
  <rect x="20" y="140" width="80" height="60" rx="12" fill="#1F2A2E"/>
  <rect x="110" y="140" width="80" height="60" rx="12" fill="#5B6770"/>
  <rect x="200" y="140" width="80" height="60" rx="12" fill="#7C8690"/>
  <rect x="290" y="140" width="80" height="60" rx="12" fill="#A85A2C"/>
  <rect x="380" y="140" width="80" height="60" rx="12" fill="#F7E8DC" stroke="#E8E3D8"/>
  <rect x="470" y="140" width="80" height="60" rx="12" fill="#9B3232"/>
  <rect x="560" y="140" width="80" height="60" rx="12" fill="#1F4A66"/>
  <text x="60" y="217" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">text</text>
  <text x="150" y="217" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">text-muted</text>
  <text x="240" y="217" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">text-subtle</text>
  <text x="330" y="217" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">warn</text>
  <text x="420" y="217" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">warn-soft</text>
  <text x="510" y="217" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">danger</text>
  <text x="600" y="217" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" fill="#1F2A2E">focus</text>
</svg>

| Token | Hex | Contrast on `--bg` | Role |
|---|---|---|---|
| `--bg` | `#FAF8F4` | — | App background. Warm off-white, not stark. |
| `--surface` | `#FFFFFF` | — | Cards and elevated surfaces. |
| `--surface-sunken` | `#F4F1EB` | — | Recessed areas, input backgrounds. |
| `--border` | `#E8E3D8` | — | Hairlines, dividers. Warm, not grey. |
| `--border-strong` | `#C9C2B0` | — | Input borders. |
| `--text` | `#1F2A2E` | **15.2 : 1 ✓ AAA** | Primary text. |
| `--text-muted` | `#5B6770` | **7.1 : 1 ✓ AAA** | Secondary text. |
| `--text-subtle` | `#7C8690` | 4.7 : 1 ✓ AA | Captions only. **Never** primary information. |
| `--primary` | `#3F7A6E` | 5.2 : 1 | Primary action. Muted teal. |
| `--primary-text` | `#FFFFFF` | 8.4 : 1 on `--primary` | Text on primary surfaces. |
| `--primary-soft` | `#E3EEEB` | — | Primary backgrounds at low emphasis. |
| `--warn` | `#A85A2C` | 4.9 : 1 | *Important*, not alarming. |
| `--warn-soft` | `#F7E8DC` | — | Warning backgrounds. |
| `--danger` | `#9B3232` | 6.8 : 1 | Destructive only. |
| `--focus` | `#1F4A66` | — | Focus ring. |

### What we explicitly do not have

- **No red for errors.** `--warn` (warm orange-brown) signals attention without triggering an alarm response. `--danger` is reserved for genuinely destructive operations (delete, leave circle).
- **No green for success.** Confirmation is communicated through copy and motion. *"Sparat"* in muted text fading after 2 s is the success state.
- **No gradients.** Surfaces are flat.
- **No brand purple, no brand pink, no neon anything.** If a color isn't in the table, it isn't in the product.

### Dark mode

Not in MVP. The audience reads in daylight and well-lit homes; dark mode adds surface area and contrast risk without addressing a known need. Revisit after launch only if beta users specifically request it.

---

## 3. Typography

**Family:** Inter, with system fallback. Free, screen-optimized, complete Latin support (covers å, ä, ö correctly without fallback drift). Loaded via `next/font` for zero layout shift.

**Accessibility option** (Sprint 4+): user can switch to **Atkinson Hyperlegible** — designed by the Braille Institute for low-vision readers. Stored as a per-user preference, not a per-session toggle.

### Scale

Sizes in `rem`. Root is 16 px. Body floor is 17 px = `1.0625rem`. **Never below this in production UI.**

<svg viewBox="0 0 720 320" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;background:#FAF8F4;">
  <text x="30" y="50" font-family="Inter,sans-serif" font-size="32" font-weight="600" fill="#1F2A2E">God morgon, Adrian</text>
  <text x="690" y="50" font-family="Inter,sans-serif" font-size="11" fill="#7C8690" text-anchor="end">display · 32 / 1.2 · 600</text>
  <text x="30" y="100" font-family="Inter,sans-serif" font-size="24" font-weight="600" fill="#1F2A2E">Dagens uppdatering</text>
  <text x="690" y="100" font-family="Inter,sans-serif" font-size="11" fill="#7C8690" text-anchor="end">h1 · 24 / 1.3 · 600</text>
  <text x="30" y="145" font-family="Inter,sans-serif" font-size="20" font-weight="600" fill="#1F2A2E">Maria, assistent</text>
  <text x="690" y="145" font-family="Inter,sans-serif" font-size="11" fill="#7C8690" text-anchor="end">h2 · 20 / 1.35 · 600</text>
  <text x="30" y="190" font-family="Inter,sans-serif" font-size="19" font-weight="400" fill="#1F2A2E">Åt bra till frukost, lite trött efter promenaden.</text>
  <text x="690" y="190" font-family="Inter,sans-serif" font-size="11" fill="#7C8690" text-anchor="end">body-lg · 19 / 1.55 · 400</text>
  <text x="30" y="230" font-family="Inter,sans-serif" font-size="17" font-weight="400" fill="#1F2A2E">Det här är vanlig brödtext i appen.</text>
  <text x="690" y="230" font-family="Inter,sans-serif" font-size="11" fill="#7C8690" text-anchor="end">body · 17 / 1.55 · 400</text>
  <text x="30" y="265" font-family="Inter,sans-serif" font-size="15" font-weight="500" fill="#5B6770">igår 09:14 · Maria</text>
  <text x="690" y="265" font-family="Inter,sans-serif" font-size="11" fill="#7C8690" text-anchor="end">meta · 15 / 1.45 · 500</text>
  <text x="30" y="295" font-family="Inter,sans-serif" font-size="14" font-weight="500" fill="#5B6770">Humör</text>
  <text x="690" y="295" font-family="Inter,sans-serif" font-size="11" fill="#7C8690" text-anchor="end">caption · 14 / 1.4 · 500</text>
</svg>

| Token | Size | Line height | Weight | Use |
|---|---|---|---|---|
| `text-display` | 2 rem (32 px) | 1.2 | 600 | App-level greeting only |
| `text-h1` | 1.5 rem (24 px) | 1.3 | 600 | Screen titles |
| `text-h2` | 1.25 rem (20 px) | 1.35 | 600 | Card titles |
| `text-body-lg` | 1.1875 rem (19 px) | 1.55 | 400 | Important body, daily update text |
| `text-body` | 1.0625 rem (17 px) | 1.55 | 400 | Default body |
| `text-meta` | 0.9375 rem (15 px) | 1.45 | 500 | Timestamps, author names |
| `text-caption` | 0.875 rem (14 px) | 1.4 | 500 | Form labels only. Never primary content. |

### Rules

- Maximum line length for body: **65 characters**. Enforce with `max-w-prose` or explicit `max-width`.
- Never `text-transform: uppercase` anywhere. It signals corporate energy.
- Never italics for emphasis. Use weight 600 instead.
- Numerals are tabular in metadata: `font-variant-numeric: tabular-nums`.
- Swedish quotation marks: `"..."` for inner, `»...«` for emphasis (rare). Never straight `"..."`.

---

## 4. Spacing and layout

Multiples of 4 px, matching Tailwind defaults. **Use the scale, never arbitrary values.**

| Token | Value | Where |
|---|---|---|
| `space-1` | 4 px | Inside dense components only |
| `space-2` | 8 px | Default tight |
| `space-3` | 12 px | |
| `space-4` | 16 px | Default comfortable |
| `space-6` | 24 px | Between unrelated elements |
| `space-8` | 32 px | Between sections within a screen |
| `space-12` | 48 px | Around the primary CTA |
| `space-16` | 64 px | Top of screen, below header |

### Container widths

- **Mobile** (default): 16 px horizontal padding, content fills width.
- **Tablet** (≥ 640 px): max-width 560 px, centered.
- **Desktop** (≥ 1024 px): max-width 640 px, centered. *We do not build wide desktop layouts.* The app on desktop is the same app, slightly larger.

### Safe areas

All screens respect `env(safe-area-inset-*)` on iOS. The bottom navigation in particular must sit above the home indicator.

---

## 5. Radius and elevation

### Radius

<svg viewBox="0 0 600 110" xmlns="http://www.w3.org/2000/svg" style="background:#FAF8F4;">
  <rect x="20" y="20" width="80" height="60" rx="8" fill="#FFFFFF" stroke="#E8E3D8"/>
  <text x="60" y="100" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="#1F2A2E">sm · 8</text>
  <rect x="140" y="20" width="80" height="60" rx="12" fill="#FFFFFF" stroke="#E8E3D8"/>
  <text x="180" y="100" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="#1F2A2E">md · 12</text>
  <rect x="260" y="20" width="80" height="60" rx="16" fill="#FFFFFF" stroke="#E8E3D8"/>
  <text x="300" y="100" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="#1F2A2E">lg · 16</text>
  <rect x="380" y="20" width="140" height="60" rx="30" fill="#FFFFFF" stroke="#E8E3D8"/>
  <text x="450" y="100" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" fill="#1F2A2E">pill · 9999</text>
</svg>

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 8 px | Inputs |
| `radius-md` | 12 px | Cards, secondary buttons |
| `radius-lg` | 16 px | Primary buttons, modals, sheets |
| `radius-pill` | 9999 px | Mood/sleep/energy pickers, status chips |

### Elevation

Three levels. Never stack — a card never sits on a card.

- **Flat.** No shadow. Default for content sitting directly on `--bg`.
- **Soft.** `0 1px 2px rgba(31, 42, 46, 0.04), 0 4px 12px rgba(31, 42, 46, 0.04)`. Cards, list items.
- **Lifted.** `0 2px 4px rgba(31, 42, 46, 0.06), 0 12px 32px rgba(31, 42, 46, 0.08)`. Modals, toasts, bottom sheets.

---

## 6. Motion

### Durations

| Token | ms | Use |
|---|---|---|
| `motion-instant` | 120 | Tap feedback, focus rings |
| `motion-quick` | 200 | Button press, color transitions |
| `motion-default` | 280 | Card appears, sheet slides up |
| `motion-slow` | 420 | Screen transitions |

### Easings

```css
--ease-standard: cubic-bezier(0.2, 0, 0, 1);   /* Material "emphasized decelerate". Default. */
--ease-exit:     cubic-bezier(0.4, 0, 1, 1);   /* Elements leaving the screen. */
```

### `prefers-reduced-motion`

Mandatory. When set, all transitions reduce to a 100 ms opacity fade. No translation, no scaling, no slide. Implemented globally:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 100ms !important;
    transition-property: opacity !important;
    animation-duration: 100ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

### Specific transitions

- **Button press.** Background color shift, 200 ms `--ease-standard`. No scale, no shadow change.
- **Sheet slide-up.** TranslateY from 100% to 0, 280 ms `--ease-standard`.
- **Toast enter.** Opacity 0 → 1 + translateY −8 px → 0, 200 ms `--ease-standard`.
- **Page transition.** Opacity 0 → 1, 200 ms. No slide (slides feel like navigation; we want arrival).
- **Skeleton pulse.** Background opacity 1 → 0.6 → 1, 1.8 s infinite, `ease-in-out`.

---

## 7. Iconography

**Library:** [Lucide](https://lucide.dev). Already a peer of shadcn/ui. Open source, consistent, extensive Latin and abstract coverage.

**Sizing.** 20 px inside text or buttons. 24 px standalone. 28 px in navigation. **Never** below 16 px.

**Stroke width.** 1.75 px (Lucide default 2 looks slightly heavy against Inter; 1.5 feels too thin). Configure once in the Icon wrapper.

**Color.** Icons inherit `currentColor`. Never hard-coded.

**Semantic vs decorative.**
- Decorative: `aria-hidden="true"`.
- Semantic (the only thing communicating meaning): `<title>` or visible label.

**Emoji as icons.** Allowed only inside user-facing content (the mood picker, AI summaries quoting user text). Not in nav, buttons, or system chrome.

---

## 8. Components

shadcn/ui as the base. Each component below documents what we override.

### 8.1 Button

<svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" style="background:#FAF8F4;">
  <rect x="30" y="20" width="280" height="52" rx="16" fill="#3F7A6E"/>
  <text x="170" y="52" text-anchor="middle" font-family="Inter,sans-serif" font-size="17" font-weight="600" fill="#FFFFFF">Lägg till uppdatering</text>
  <text x="330" y="50" font-family="Inter,sans-serif" font-size="12" fill="#5B6770">Primary · single CTA per screen</text>
  <rect x="30" y="92" width="280" height="52" rx="16" fill="#FFFFFF" stroke="#C9C2B0" stroke-width="1"/>
  <text x="170" y="124" text-anchor="middle" font-family="Inter,sans-serif" font-size="17" font-weight="600" fill="#1F2A2E">Avbryt</text>
  <text x="330" y="122" font-family="Inter,sans-serif" font-size="12" fill="#5B6770">Secondary · alternate path</text>
  <text x="30" y="186" font-family="Inter,sans-serif" font-size="17" font-weight="600" fill="#3F7A6E">Visa alla</text>
  <text x="330" y="186" font-family="Inter,sans-serif" font-size="12" fill="#5B6770">Text · tertiary inside cards</text>
  <rect x="30" y="216" width="280" height="52" rx="16" fill="#FFFFFF" stroke="#9B3232" stroke-width="1"/>
  <text x="170" y="248" text-anchor="middle" font-family="Inter,sans-serif" font-size="17" font-weight="600" fill="#9B3232">Lämna kretsen</text>
  <text x="330" y="246" font-family="Inter,sans-serif" font-size="12" fill="#5B6770">Destructive · confirms before acting</text>
</svg>

| Variant | Use | Visual |
|---|---|---|
| **Primary** | Single CTA per screen | `--primary` fill, `--primary-text`, `radius-lg` |
| **Secondary** | Alternate path | `--surface` fill, 1 px `--border-strong`, `--text` |
| **Text** | Tertiary actions inside cards | No fill, no border, `--primary` text, underline on focus |
| **Destructive** | Delete, leave | `--surface` fill, `--danger` border + text. Always two-step. |

**Sizing.**

- Default height: **52 px**. Larger than typical — comfortable one-handed press for stressed users.
- Minimum tap target: **48 × 48 px**. Smaller-looking buttons must still have 48 px of clickable area via padding.
- Horizontal padding: 24 px.
- Loading state: spinner replaces label, button stays at full width and same height.

**States.**

```
default        — base
hover          — background shifts one tone (web only; mobile ignores)
active/pressed — scale unchanged, background one tone darker
focus-visible  — 2 px --focus ring, 2 px offset
disabled       — 60% opacity, cursor not-allowed, no hover effect
loading        — spinner instead of label, click ignored
```

**Never.**

- No icon-only buttons in primary navigation paths.
- No "ghost on dark" or fancy hover-fill effects.
- No double-confirmation modals on non-destructive actions.

### 8.2 Card

The primary content container.

- Background: `--surface`.
- Radius: `radius-md`.
- Elevation: Soft.
- Padding: `space-4` (16 px) mobile, `space-6` (24 px) larger.
- Inner gap: `space-3` between elements.

Cards never have borders *and* shadows. Pick one. Default is shadow.

Cards never nest. Putting a card inside a card means the layout is wrong.

### 8.3 Mood / Sleep / Energy picker

The defining component for §5.1 daily update.

<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg" style="background:#FAF8F4;">
  <text x="30" y="40" font-family="Inter,sans-serif" font-size="14" font-weight="500" fill="#5B6770">Humör</text>
  <rect x="30" y="56" width="150" height="80" rx="40" fill="#E3EEEB" stroke="#3F7A6E" stroke-width="2"/>
  <text x="105" y="94" text-anchor="middle" font-size="28">😌</text>
  <text x="105" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="600" fill="#1F2A2E">Glad</text>
  <rect x="190" y="56" width="150" height="80" rx="40" fill="#FFFFFF" stroke="#E8E3D8"/>
  <text x="265" y="94" text-anchor="middle" font-size="28">🙂</text>
  <text x="265" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="500" fill="#5B6770">Lugn</text>
  <rect x="350" y="56" width="150" height="80" rx="40" fill="#FFFFFF" stroke="#E8E3D8"/>
  <text x="425" y="94" text-anchor="middle" font-size="28">😐</text>
  <text x="425" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="500" fill="#5B6770">Trött</text>
  <rect x="510" y="56" width="150" height="80" rx="40" fill="#FFFFFF" stroke="#E8E3D8"/>
  <text x="585" y="94" text-anchor="middle" font-size="28">😣</text>
  <text x="585" y="120" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="500" fill="#5B6770">Orolig</text>
</svg>

**Mood:** four options *Glad / Lugn / Trött / Orolig*. Single-select. Selected pill fills with `--primary-soft`, 2 px `--primary` border, label weight 600. Pills fill available row width via grid-cols-4 (mood) or grid-cols-3 (sleep, energy). Height minimum 80 px, gap 8 px. On viewports ≥ 640 px the row caps at max-w-content so pills don't stretch wider than ~150 px each. Emoji size 28 px.

**Sleep:** three options *Bra / Okej / Dålig*. Same pattern, no emoji.

**Energy:** three options *Hög / Medel / Låg*. Same pattern, no emoji.

The three pickers stack vertically with `space-6` between them. Labels above each picker, `text-caption`, weight 500: *Humör*, *Sömn i natt*, *Energi idag*.

### 8.4 Text input

- Height: 52 px (matches Button).
- Background: `--surface-sunken`.
- Border: 1 px `--border`, becomes 2 px `--focus` on focus.
- Radius: `radius-sm`.
- Padding: 16 px horizontal.
- Label above, `text-caption`, weight 500, `--text`. **Never floating labels** — they fail at zoom and add motion noise.
- Error state: 1 px `--warn` border, message below in `text-meta` size, `--warn` color.

**The free-text field on daily updates:** max 280 chars. Counter appears only when fewer than 40 remain, in `--text-subtle`. No counter when there's plenty of room — that's noise.

### 8.5 Bottom navigation

Three tabs in MVP. Four maximum, ever.

<svg viewBox="0 0 720 120" xmlns="http://www.w3.org/2000/svg" style="background:#FAF8F4;">
  <rect x="20" y="20" width="680" height="80" rx="0" fill="#FFFFFF"/>
  <line x1="20" y1="20" x2="700" y2="20" stroke="#E8E3D8"/>
  <g transform="translate(110, 32)">
    <path d="M0 10 L12 0 L24 10 L24 24 L0 24 Z" fill="none" stroke="#3F7A6E" stroke-width="1.75"/>
    <text x="12" y="50" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="600" fill="#3F7A6E">Hem</text>
  </g>
  <g transform="translate(335, 32)">
    <rect x="0" y="2" width="24" height="22" rx="2" fill="none" stroke="#5B6770" stroke-width="1.75"/>
    <line x1="0" y1="9" x2="24" y2="9" stroke="#5B6770" stroke-width="1.75"/>
    <text x="12" y="50" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="500" fill="#5B6770">Kalender</text>
  </g>
  <g transform="translate(560, 32)">
    <circle cx="12" cy="9" r="6" fill="none" stroke="#5B6770" stroke-width="1.75"/>
    <path d="M0 26 Q12 18 24 26" fill="none" stroke="#5B6770" stroke-width="1.75"/>
    <text x="12" y="50" text-anchor="middle" font-family="Inter,sans-serif" font-size="13" font-weight="500" fill="#5B6770">Min sida</text>
  </g>
</svg>

| Tab | Icon | Label | Route |
|---|---|---|---|
| 1 | house | Hem | `/app` |
| 2 | calendar | Kalender | `/app/schema` |
| 3 | user | Min sida | `/app/mig` |

- Height: 64 px + safe area.
- Background: `--surface`, top border 1 px `--border`.
- Active tab: icon and label `--primary`, weight 600.
- Inactive: `--text-muted`, weight 500.
- **No badge counts on tabs in MVP.** Notification dots create anxiety; they belong in apps designed for engagement.

### 8.6 App bar (top)

- Height: 56 px on mobile, 64 px on larger.
- Background: `--bg` (matches body, no visible separator until scroll).
- On scroll: 1 px `--border` bottom appears.
- Title: `text-h1`, centered.
- Left slot: back arrow when applicable, never a hamburger.
- Right slot: max one action, icon-only, 48 × 48 px tap target.

### 8.7 Bottom sheet

Default mobile container for forms and confirmations.

- Background: `--surface`.
- Radius: `radius-lg` top corners only, 0 bottom.
- Drag handle (32 × 4 px, `--border-strong`, centered) at top.
- Enters with slide-up + backdrop opacity 0 → 0.5.
- Dismissible by tap on backdrop, drag down, or close button.

Prefer over modals on mobile. Modals are reserved for content that needs to block the entire viewport (destructive confirmations).

### 8.8 Avatar

40 px in lists, 56 px on profile screens. Initials fallback: `--primary-soft` background, `--primary` text, weight 600, single letter.

### 8.9 Status chip

Pill-shaped, used in lists to indicate state. `text-caption`, weight 500, padding 4 × 10 px.

- *Aktiv*: `--primary-soft` background, `--primary` text.
- *Tidigare*: `--surface-sunken` background, `--text-muted` text.
- *Akut*: `--warn-soft` background, `--warn` text. Classes: `bg-warn-soft text-warn text-caption font-medium px-2 py-1 rounded-pill`. Used on urgent reminders only.

### 8.10 Empty states

Pattern: short, warm, factual. Never apologetic. Never "let's get started!" energy.

| Context | Copy | Visual |
|---|---|---|
| No updates today | *Inga uppdateringar än idag.* | Text only, `--text-muted` |
| First-time user (no circle yet) | *Välkommen. Du är inte med i någon krets än.* | Primary CTA: *Skapa en krets* |
| Awaiting invitation (no circle yet) | *Du är inte med i någon krets än. En anhörig kan bjuda in dig.* | No CTA — they can't fix this themselves |
| No reminders | *Inga påminnelser just nu.* | Nothing else |

### 8.11 Loading states

- **Skeleton over spinner.** Every list, card, and content area uses content-shaped skeletons. Spinners only inside buttons during action submission.
- Skeleton background: `--surface-sunken`. Animation: gentle pulse, 1.8 s, respects `prefers-reduced-motion`.
- **Never** use percentage progress bars unless we genuinely know the percentage. Estimating progress is a lie that erodes trust.

### 8.12 Toasts

- Position: top, below app bar. Not bottom — bottom obscures the nav.
- Duration: 4 s default, 6 s for errors.
- Variants: neutral (`--surface` + `--text`), warn (`--warn-soft` + `--warn`), danger (rare).
- One toast at a time. Never stack.
- Dismissible by tap.

---

## 9. Screen patterns

Textual wireframes for each MVP feature. These are the canonical layouts; deviation needs a reason.

### 9.1 Sign in

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│           TryggKontakt              │  ← text-display
│                                     │
│        En lugn plats för            │  ← text-body, muted
│       de runt en person.            │
│                                     │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ E-postadress                │   │  ← input
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Skicka inloggningslänk    │   │  ← primary button
│   └─────────────────────────────┘   │
│                                     │
│                                     │
│                                     │
│         Hjälp · Integritet          │  ← text-meta, muted
│                                     │
└─────────────────────────────────────┘
```

One field, one button. Help and privacy links at bottom, never above the fold. No "create account" link — accounts are created only by invitation.

### 9.2 Home (`/app`)

```
┌─────────────────────────────────────┐
│  God morgon, Adrian                 │  ← greeting, time-aware
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Senaste från Maria            │  │  ← card · last update
│  │ idag 09:14                    │  │
│  │                               │  │
│  │ 🙂 lugn · Sömn okej · Energi  │  │
│  │ medel                         │  │
│  │                               │  │
│  │ Åt bra till frukost, lite     │  │
│  │ trött efter promenaden.       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   Lägg till uppdatering       │  │  ← primary CTA
│  └───────────────────────────────┘  │
│                                     │
│  Idag                                │  ← h2
│  • 14:00 Tandläkare                  │
│  • 17:00 Maria slutar pass           │
│                                     │
├─────────────────────────────────────┤
│   Hem      Kalender    Min sida     │  ← bottom nav
└─────────────────────────────────────┘
```

**Greeting** changes by time of day: *God morgon* (05–10), *Hej* (10–17), *God kväll* (17–04). Never use the day of the week — that adds cognitive load.

**Last update card** doubles as §5.2 "Status just nu". One card, not a feed.

**Today list** is read-only on this screen. Tapping an item opens it.

### 9.3 Create daily update (`/app/uppdatering/ny`)

Bottom sheet from Home's primary CTA, or full screen if entered directly.

```
┌─────────────────────────────────────┐
│  ←                          Spara   │  ← app bar
│                                     │
│  Ny uppdatering                     │  ← h1
│                                     │
│  Humör                              │
│  ┌──────┬──────┬──────┬──────┐      │
│  │  😌  │  🙂  │  😐  │  😣  │      │
│  │ Glad │ Lugn │ Trött│Orolig│      │
│  └──────┴──────┴──────┴──────┘      │
│                                     │
│  Sömn i natt                        │
│  ┌──────────┬──────────┬──────────┐ │
│  │   Bra    │   Okej   │  Dålig   │ │
│  └──────────┴──────────┴──────────┘ │
│                                     │
│  Energi idag                        │
│  ┌──────────┬──────────┬──────────┐ │
│  │   Hög    │  Medel   │   Låg    │ │
│  └──────────┴──────────┴──────────┘ │
│                                     │
│  Anteckning                         │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  📷 Lägg till bild                  │  ← text button
│                                     │
└─────────────────────────────────────┘
```

**Save lives in the app bar, not at the bottom.** This is a deliberate choice — bottom CTAs are reserved for primary screens, not forms. The user reads top to bottom and reaches "Save" at the end of the form by scrolling, not by hunting.

**Field order** is *Mood → Sleep → Energy → Text → Image*, matching the cognitive flow ("How were they? How did they sleep? How's their energy? Anything specific? Want to show it?").

### 9.4 Schedule (`/app/schema`)

```
┌─────────────────────────────────────┐
│  Kalender                        +  │
│                                     │
│  Måndag 28 maj                       │  ← h2 sticky per day
│  ┌───────────────────────────────┐  │
│  │ 09:00  Skola                  │  │
│  │        Sara följer med        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 14:00  Tandläkare              │  │
│  └───────────────────────────────┘  │
│                                     │
│  Tisdag 29 maj                       │
│  ┌───────────────────────────────┐  │
│  │ 10:00  Habilitering            │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│   Hem      Kalender    Min sida     │
└─────────────────────────────────────┘
```

Week view by default. Each day is a section. **No month view in MVP** — month grids are dense and abstract; week is the cognitive unit families actually plan around.

### 9.5 Reminders (`/app/paminnelser`)

Reachable from Home as a card section, not a top-level nav item — reminders are too infrequent to deserve a tab.

```
┌─────────────────────────────────────┐
│  ←  Påminnelser                  +  │
│                                     │
│  Idag                                │
│  ┌───────────────────────────────┐  │
│  │ 14:00  Tandläkare              │  │
│  │        Maria är meddelad      │  │
│  └───────────────────────────────┘  │
│                                     │
│  Den här veckan                      │
│  ┌───────────────────────────────┐  │
│  │ Torsdag 13:00  Frisören        │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 9.6 Weekly summary email

See §11. Not displayed in-app in MVP; arrives by email Sunday evening. Reading the summary should feel like opening a card, not opening a report.

### 9.7 Min sida (`/app/mig`)

```
┌─────────────────────────────────────┐
│  Min sida                            │
│                                     │
│  ┌─AD─┐                              │
│  │    │  Adrian Domeij               │  ← avatar + name
│  └────┘  Anhörig                     │  ← role chip
│                                     │
│  Kretsen                             │  ← h2
│  ┌───────────────────────────────┐  │
│  │ Eliasʼ krets                   │  │
│  │ 5 personer · 2 anhöriga        │  │
│  └───────────────────────────────┘  │
│                                     │
│  Inställningar                       │
│  • Notiser                          │
│  • Tillgänglighet                   │
│  • Integritet                       │
│                                     │
│  Logga ut                           │  ← destructive text button
│                                     │
├─────────────────────────────────────┤
│   Hem      Kalender    Min sida     │
└─────────────────────────────────────┘
```

---

## 10. Voice and tone (Swedish)

This is the section to open *before* writing any copy. Tone is a design decision; treat it as one.

### Five rules

1. **Speak to one tired person, not a userbase.** *Du*, never *ni*.
2. **Verbs over nouns.** *"Lägg till en uppdatering"*, not *"Tillägg av uppdatering"*.
3. **Short. Then shorter.** If a sentence has more than 12 words, try splitting it.
4. **Name the person.** Never *patient*, *brukare*, or *klient*. Use the person's first name or *personen*.
5. **No exclamation marks. Anywhere.**

### Concrete copy

**Buttons**

| Good | Bad |
|---|---|
| *Spara* | *Skicka in formulär* |
| *Bjud in* | *Lägg till ny användare* |
| *Lägg till uppdatering* | *Skapa ny post* |
| *Stäng* | *Avbryt och stäng dialogrutan* |
| *Logga ut* | *Avsluta session* |

**Empty states**

Good: *Inga uppdateringar än idag.*
Bad: *Inga poster hittades.*
Bad: *Hoppsan, det finns inget här ännu! 🌱*

**Errors**

Good: *Det gick inte att spara just nu. Försök igen om en stund.*
Good: *Bilden är för stor. Den får vara max 5 MB.*
Bad: *Fel uppstod.*
Bad: *Server returned status 500.*
Bad: *Något gick fel 😬 men oroa dig inte!*

**Success**

Good: *Sparat.* (fades after 2 s)
Good: *Inbjudan skickad till maria@example.com.*
Bad: *Framgång!*
Bad: *Klart! 🎉*

**Notifications (push and email subject lines)**

Good: *Maria uppdaterade morgonen.*
Good: *Påminnelse: tandläkaren kl 14.*
Bad: *Du har 1 ny notifikation*
Bad: *Glöm inte din påminnelse! 🔔*

**AI-generated weekly summary**

Good: *Den här veckan var morgnarna lugna. Onsdagens simning gav glädje, torsdag eftermiddag var lite orolig.*
Bad: *Patienten uppvisar förbättrad sömnkvalitet.* (clinical)
Bad: *Vilken vecka! 🎉* (perky)
Bad: *Det verkar som medicineringen börjar verka.* (inferential — off-limits per `PROJECT.md` §10)

### Words we avoid

| Avoid | Use instead |
|---|---|
| Patient, brukare, klient | Personens namn, or *personen* |
| Användare | The role in context: *anhörig*, *personal*, *samordnare* |
| Logga in | *Öppna appen* where possible |
| Konto | *Inloggning*, or describe the action |
| Funktion | Describe the actual thing |
| System | Describe the actual thing |
| Skicka | *Spara*, *Bjud in* — *skicka* feels transactional |
| Bekräfta | *Spara*, *Ja, ta bort*, etc. — confirm what specifically |

### Date and time

- Today: *idag* (no date)
- Yesterday: *igår* (no date)
- This week: weekday only — *måndag*, *tisdag*
- Older: *13 maj* (no year unless ambiguous)
- Time: 24-hour, *kl 09:14*, but in chrome positions drop the *kl*: *09:14*

---

## 11. Email design

Email is the default notification channel per `PROJECT.md`. The weekly summary, daily-update notifications, invitations, and reminders all arrive here. Email design is part of the product, not an afterthought.

### Layout

- **Width:** 560 px content, 600 px outer (Gmail clip-safe).
- **Background:** `#FAF8F4` (matches app `--bg`).
- **Content card:** `#FFFFFF`, `radius-md`, 32 px padding, centered.
- **Font:** Inter via Google Fonts link with system fallback. Email clients are inconsistent — Helvetica is the fallback we accept.

### Daily-update email

```
Subject: Maria uppdaterade morgonen.

[TryggKontakt logo, 32 px]

Maria, assistent · idag 09:14

🙂 Lugn  ·  Sömn okej  ·  Energi medel

Åt bra till frukost, lite trött efter
promenaden. Pratade mycket om tåget
vi såg på lördagen.

[Öppna i TryggKontakt → ]

---
Du får det här mejlet eftersom du är
anhörig i Eliasʼ krets. Inställningar.
```

### Weekly summary email

```
Subject: Sammanfattning av veckan i Eliasʼ krets.

[TryggKontakt logo]

God söndag kväll.

Den här veckan var morgnarna lugna.
Onsdagens simning gav glädje, torsdag
eftermiddag var lite orolig. Sömnen
har varit jämnare än förra veckan.

[Öppna kretsen → ]

---
Genererad av TryggKontakt på söndagar.
Anhöriga får sammanfattningen automatiskt.
Stäng av i kretsens inställningar.
```

### Rules

- **No images in content except logos and user-uploaded photos.** Stock email graphics undermine the calm.
- **One link per email** is the CTA. Footer links don't count.
- **Plain-text version** generated automatically for every email. Test that it reads well.
- **Subject lines in same voice** as in-app copy. Sentence case, period at the end, no preview-text emoji.

---

## 12. PWA and app assets

### Icon

- **Mark:** A single rounded square (`radius-lg`) on `--primary` background, white sans-serif "T" centered. Bold, weight 700, 60% of icon height.
- **Sizes generated:** 192, 256, 384, 512 px (`maskable` and standard).
- **No drop shadow, no gradient, no skeuomorphic flourish.**

### Apple touch icon

180 × 180 PNG, no transparency, no rounded corners (iOS rounds them for us).

### Splash screen

White background, mark centered, no text. iOS generates from `apple-touch-startup-image`.

### Manifest

```json
{
  "name": "TryggKontakt",
  "short_name": "Trygg",
  "description": "En lugn kontakt mellan alla som stöttar.",
  "start_url": "/app",
  "display": "standalone",
  "background_color": "#FAF8F4",
  "theme_color": "#3F7A6E",
  "lang": "sv-SE",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Install prompt

**Do not auto-show.** Instead, surface a small text-button on `/app/mig` after the user has been active for at least three days: *Lägg till TryggKontakt på hemskärmen.* Tap opens the native prompt (or instructions for iOS Safari, since iOS doesn't expose `beforeinstallprompt`).

---

## 13. Onboarding copy

The first time a user opens the app. Three screens maximum. **No carousel.**

### Screen 1: Invitation accept

```
Hej.

Du har blivit inbjuden till Eliasʼ krets
av Anna Domeij.

Som anhörig kan du läsa och skriva
allt om Elias.

[ Acceptera inbjudan → ]
```

### Screen 2: Name (only if not provided)

```
Vad heter du?

[ Förnamn          ]

[ Efternamn        ]

Det här syns för andra i kretsen.

[ Fortsätt → ]
```

### Screen 3: First visit to Home

No tutorial overlay. The empty state on Home says it all:

```
God morgon, Adrian.

Inga uppdateringar än idag.

[ Lägg till uppdatering ]
```

Done. The product teaches itself.

---

## 14. Accessibility — concrete and testable

Every value here is checkable in CI or via Lighthouse / axe. Aspirations don't belong in this section.

| Requirement | Value | Verified by |
|---|---|---|
| Body text size | ≥ 17 px | Stylelint custom rule |
| Body contrast | ≥ 7:1 on default background | axe |
| Large text contrast | ≥ 4.5:1 | axe |
| Tap target | ≥ 48 × 48 px | Manual + Playwright |
| Focus visible | 2 px solid `--focus`, 2 px offset | axe |
| Keyboard reachable | All actions | Playwright tab-through script |
| Reduced motion | Respected in global CSS | Manual smoke |
| Page zoom | Works at 200% without horizontal scroll | Manual |
| Form labels | Every input labelled | axe |
| Heading order | No skipped levels | axe |
| Language declared | `<html lang="sv-SE">` | Lighthouse |
| Color not sole channel | Icons or text accompany all color signals | Manual review |

**A flow that fails any of these is not "almost done." It is broken.**

### Specific patterns

- **Errors are not communicated by color alone.** Color + icon + text.
- **Focus order matches visual order.** Use DOM order, not `tabindex` hacks.
- **`aria-live="polite"`** on the toast container so screen readers announce them.
- **`aria-current="page"`** on the active bottom nav tab.
- **No `outline: none`** without an explicit replacement focus ring of equal or greater visibility.
- **Touch and pointer.** Every gesture must have a tap/click equivalent. No swipe-only actions.

### Testing tools

```bash
# In CI
npx playwright test tests/a11y/

# Local axe scan
npx axe-cli http://localhost:3000

# Contrast spot-check
# Use https://webaim.org/resources/contrastchecker/ for any new color pairing
```

---

## 15. Performance budgets (design-related)

Design choices have load and runtime costs. These are budgets, not targets.

| Asset | Budget |
|---|---|
| Custom fonts | 2 weights of Inter (400, 600), latin + latin-ext subset, woff2. ~60 KB. |
| Icon library | Tree-shaken Lucide imports only. **No** lucide-react full bundle. |
| Largest hero image | None — we have no hero images. |
| User-uploaded image | Max 5 MB before client-side compression; 800 KB target after. |
| Total CSS | ≤ 50 KB gzipped (Tailwind purge enforced). |
| Animations on a screen | Max 2 simultaneously. |
| Third-party scripts on auth screens | Zero. |

---

## 16. What we do not have

Things that look design-related but are explicitly absent. New contributors will ask about each of these — point them here.

- **No dark mode** (see §2).
- **No theming or per-user color customization.**
- **No achievements, streaks, or progress visualizations.** Not a habit tracker.
- **No charts or graphs.** Not a dashboard.
- **No onboarding carousels.** First-run is the screens in §13.
- **No splash screens beyond what iOS PWA install requires.**
- **No haptics beyond browser defaults.**
- **No sounds.**
- **No animated emojis or stickers.**
- **No notification badge counts.**
- **No swipe gestures for primary actions** (only secondary like dismiss).
- **No infinite scroll.** Pagination by week or by 20 items.

---

## 17. Decision log

When a non-obvious design decision is made, append it here. Each entry: date, decision, what was considered, why.

- **2026-05 — Single-column on desktop, max 640 px.** Considered: wide multi-column layout. Rejected because the audience opens the app on phone 90% of the time, and a desktop dashboard implies monitoring the product is explicitly not.
- **2026-05 — Inter as default body font.** Considered: Söhne (paid), Atkinson Hyperlegible (accessibility-first but visually utilitarian), system fonts (no CLS but inconsistent). Inter chosen: free, screen-optimized, consistent. Atkinson reserved as opt-in accessibility setting.
- **2026-05 — No red for errors.** Considered: standard red. Rejected because the audience is sensitized to alarm signals; warm orange-brown communicates "needs attention" without triggering stress.
- **2026-05 — Save lives in the app bar, not at the bottom of forms.** Considered: bottom-fixed CTA. Rejected because bottom CTAs are reserved for primary screens; on forms the user reaches Save by scrolling to the end, which mirrors their cognitive flow.
- **2026-05 — Email as default notification channel, push opt-in.** Considered: push-first. Rejected because push requires a permission prompt and PWA install on iOS — friction that contradicts calm.
- **2026-05 — No month-view calendar.** Considered: standard month grid. Rejected because families plan around weeks, and month grids are visually dense.
- **2026-05 — Pill picker widths fluid on mobile.** Considered: fixed 150 px minimum per pill. Rejected because four pills plus gaps overflow a 360 px viewport. Pills now fill the row via grid; tap area still clears 48 × 48 on any phone.
- **2026-06 — Week math walks via Stockholm date strings, not UTC ms.** Considered: subtract `dayOffset * 86_400_000` ms from a UTC midnight. Rejected because that lands the wrong wall-clock day during DST transition weeks (late March / late October), grouping activities under the wrong header twice a year. We compute today's Stockholm date string, decrement whole days as strings, then re-parse each boundary via `parseStockholmDateTime` so the per-day Stockholm UTC offset is correct.
- **2026-06 — Past-due reminders hidden from `/app/paminnelser` and the home card.** Considered: keep visible until the user dismisses them. Rejected for MVP because there's no dismiss action and no notion of "done" on a reminder row yet; showing growing stale lists would erode trust. Follow-up: add an explicit *Klar* / dismissed state when we have UX for marking reminders done. Until then, past-due rows persist in the DB (so audits and the §13 access log stay intact) but the queries filter `due_at >= now()` everywhere reminders are listed.

---

## 18. Ship checklist

Run through this before merging any UI work.

1. One primary action visible? (Or zero — some screens are read-only.)
2. Body text ≥ 17 px throughout?
3. Tap targets ≥ 48 × 48 px?
4. All copy in Swedish, no avoided words?
5. Empty, loading, and error states defined and rendered?
6. Tested at 200 % zoom without horizontal scroll?
7. Keyboard reaches every action in DOM order?
8. `prefers-reduced-motion` respected?
9. Color is never the sole channel for meaning?
10. Component used is from the documented set (or, if not, was added to this doc)?

If any answer is no, it isn't ready.

---

## 19. Appendix: Tailwind config

Drop-in `tailwind.config.ts` extension that implements every token above.

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-sunken": "var(--surface-sunken)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        "text-subtle": "var(--text-subtle)",
        primary: {
          DEFAULT: "var(--primary)",
          text: "var(--primary-text)",
          soft: "var(--primary-soft)",
        },
        warn: {
          DEFAULT: "var(--warn)",
          soft: "var(--warn-soft)",
        },
        danger: "var(--danger)",
        focus: "var(--focus)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
        h1: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        h2: ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],
        "body-lg": ["1.1875rem", { lineHeight: "1.55", fontWeight: "400" }],
        body: ["1.0625rem", { lineHeight: "1.55", fontWeight: "400" }],
        meta: ["0.9375rem", { lineHeight: "1.45", fontWeight: "500" }],
        caption: ["0.875rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31, 42, 46, 0.04), 0 4px 12px rgba(31, 42, 46, 0.04)",
        lifted:
          "0 2px 4px rgba(31, 42, 46, 0.06), 0 12px 32px rgba(31, 42, 46, 0.08)",
      },
      transitionDuration: {
        instant: "120ms",
        quick: "200ms",
        DEFAULT: "280ms",
        slow: "420ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
      },
      minHeight: {
        tap: "48px",
        button: "52px",
      },
      maxWidth: {
        content: "640px",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

And `globals.css`:

```css
:root {
  --bg: #FAF8F4;
  --surface: #FFFFFF;
  --surface-sunken: #F4F1EB;
  --border: #E8E3D8;
  --border-strong: #C9C2B0;
  --text: #1F2A2E;
  --text-muted: #5B6770;
  --text-subtle: #7C8690;
  --primary: #3F7A6E;
  --primary-text: #FFFFFF;
  --primary-soft: #E3EEEB;
  --warn: #A85A2C;
  --warn-soft: #F7E8DC;
  --danger: #9B3232;
  --focus: #1F4A66;
}

html {
  background: var(--bg);
  color: var(--text);
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-inter), system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.55;
  font-variant-numeric: tabular-nums;
}

*:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 100ms !important;
    transition-property: opacity !important;
    animation-duration: 100ms !important;
    animation-iteration-count: 1 !important;
  }
}
```