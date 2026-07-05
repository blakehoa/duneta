---
name: Duneta
version: 0.1.0
system: HeroUI v3 on Tailwind CSS v4
runtime: React Router on Cloudflare Workers
intent:
  product: Application framework and operational UI kit
  feel: quiet, fast, capable, work-focused
  density: medium-high
  defaultTheme: light
  darkTheme: supported
color:
  roles:
    primary: oklch(0.56 0.18 250)
    accent: oklch(0.64 0.16 184)
    success: oklch(0.62 0.14 150)
    warning: oklch(0.72 0.14 78)
    danger: oklch(0.58 0.20 28)
    info: oklch(0.62 0.16 230)
  light:
    background: oklch(0.985 0.005 248)
    foreground: oklch(0.22 0.025 255)
    surface: oklch(1 0 0)
    surfaceMuted: oklch(0.965 0.008 248)
    border: oklch(0.88 0.012 248)
    mutedForeground: oklch(0.48 0.025 255)
  dark:
    background: oklch(0.17 0.025 255)
    foreground: oklch(0.95 0.006 248)
    surface: oklch(0.22 0.025 255)
    surfaceMuted: oklch(0.27 0.026 255)
    border: oklch(0.34 0.028 255)
    mutedForeground: oklch(0.72 0.018 248)
typography:
  fontFamily:
    sans: Arial, Helvetica, sans-serif
    mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
  scale:
    xs: 0.75rem
    sm: 0.875rem
    base: 1rem
    lg: 1.125rem
    xl: 1.25rem
    heading: 1.5rem
    display: 2.25rem
  lineHeight:
    tight: 1.2
    normal: 1.5
    relaxed: 1.65
spacing:
  1: 0.25rem
  2: 0.5rem
  3: 0.75rem
  4: 1rem
  5: 1.25rem
  6: 1.5rem
  8: 2rem
  10: 2.5rem
  12: 3rem
radius:
  xs: 0.25rem
  sm: 0.375rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
shadow:
  none: none
  sm: 0 1px 2px rgb(15 23 42 / 0.06)
  md: 0 8px 24px rgb(15 23 42 / 0.10)
motion:
  duration:
    fast: 120ms
    normal: 180ms
    slow: 240ms
  easing:
    standard: cubic-bezier(0.2, 0, 0, 1)
layout:
  contentMaxWidth: 1280px
  sidebarWidth: 16rem
  toolbarHeight: 3rem
  sectionGap: 1.5rem
components:
  button:
    radius: "{radius.md}"
    height:
      sm: 2rem
      md: 2.5rem
      lg: 3rem
    tone: clear action first, decoration second
  input:
    radius: "{radius.md}"
    minHeight: 2.5rem
    density: compact but touch-safe
  card:
    radius: "{radius.md}"
    border: "{color.light.border}"
    usage: repeated items, modals, framed tools only
  table:
    density: scannable
    rowHeight: 2.75rem
    behavior: sorting, filtering, pagination, and empty states must be explicit
  modal:
    radius: "{radius.lg}"
    behavior: focus management and escape-to-close by default
  toast:
    placement: bottom-right
    tone: concise, action-oriented
---

# Duneta Design

Duneta is a framework for building operational web applications. The interface should feel calm, direct, and capable: more like a reliable workbench than a marketing page. It should help users scan, compare, edit, and recover quickly.

This file is the design source of truth for people and agents working in this repository. The front matter contains normative tokens and component guidance. The prose explains how to apply those tokens without turning every screen into the same template.

## Principles

Prefer dense but readable screens. Duneta apps are usually admin tools, dashboards, internal systems, and data-heavy products. Prioritize clear hierarchy, predictable controls, visible state, and short paths to action.

Use HeroUI as the component foundation. Duneta wrappers should stay thin unless a product-level convention is being encoded. Do not fork HeroUI behavior casually; extend it only when Duneta needs a durable framework primitive.

Keep visual language restrained. Avoid one-note palettes, oversized decorative surfaces, nested cards, floating section cards, gradient blobs, and marketing-style hero composition inside application screens.

Make names honest. Public APIs should tell users whether they are using a Duneta primitive, a hook, config, provider, or server runtime feature. Prefer `Duneta*` for renderable components and explicit verbs such as `createDynamicComponent` for helpers.

## Layout

Application pages should use full-width page structure with constrained inner content where needed. Page sections are not cards. Cards are for repeated records, modal bodies, inspector panels, or genuinely framed tools.

Toolbars should be compact and predictable. Use icon buttons for common tools, segmented controls for modes, switches for binary settings, menus for option sets, and text buttons only for clear commands.

Tables and forms should be optimized for repeated work. Keep headings tight, labels close to fields, errors specific, and empty states actionable.

## Typography

Use `Arial, Helvetica, sans-serif` until the project adopts a branded font. Body text should be practical and legible. Reserve display-sized text for real marketing or onboarding surfaces; compact panels and dashboards need smaller, tighter headings.

Do not scale font size with viewport width. Preserve normal letter spacing.

## Color

The palette should support both light and dark modes. Primary color is a blue leaning toward indigo; accent is cyan/teal; status colors are distinct enough to avoid a single-hue interface. Use neutrals for most surfaces and reserve saturated colors for meaning and action.

Avoid interfaces dominated by purple/blue gradients, beige/brown themes, or decorative atmospheric backgrounds.

## Components

HeroUI components are the default implementation surface. Duneta wrappers expose `Duneta*` names and should preserve HeroUI props whenever possible.

`duneta/views/component` is the preferred public import for UI components. Keep renderable primitives named with the `Duneta` prefix, for example `DunetaImage` and `DunetaScript`.

`DunetaImage`, `DunetaScript`, and dynamic component helpers are Duneta primitives, not React or Next.js APIs. Their names and docs must make that clear.

## Accessibility

Every interactive control needs a programmatic name. Use native semantics and HeroUI accessibility behavior first. Do not hide focus outlines unless a replacement focus style is present.

Color must not be the only way to communicate state. Error, warning, and success states need text or icon support.

## Motion

Motion should be short and functional. Use it to explain state changes, not as decoration. Respect `prefers-reduced-motion`.

## Agent Guidance

Before generating or refactoring UI, read this file and inspect nearby components. Prefer existing Duneta wrappers and HeroUI patterns. Add new primitives only when they reduce repeated application work or encode a durable framework convention.

When a feature crosses client and server ownership, define the public developer experience in client config first and put runtime enforcement in server code only when the edge/runtime must validate, cache, or transform data.

