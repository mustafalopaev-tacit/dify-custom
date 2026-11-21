/**
 * Tacit re-brand: generate `web/themes/tacit-tokens.css` from Dify's generated
 * design tokens (`packages/dify-ui/src/themes/{light,dark}.css`).
 *
 * Dify's token files are generated upstream and must not be edited, so the fork
 * overrides them from one extra stylesheet loaded after them. This script
 * derives that stylesheet so a new upstream release (new or renamed tokens) only
 * needs a re-run:
 *
 *   node ./scripts/generate-tacit-theme.ts          # write the file
 *   node ./scripts/generate-tacit-theme.ts --check  # fail if it is stale
 *
 * Rules, in order (first match wins):
 *   1. EXPLICIT overrides below (brand roles, status colours, ink labels).
 *   2. Brand blue -> Tacit mint, by role (fill / mark / text / tint), outside the
 *      families that carry meaning (util-colors, node types, third-party marks).
 *   3. Dify's slate neutrals -> zinc (shadcn zinc preset, as in Tacit).
 *
 * Brand values come from tacit/core/web-ui/src/styles/globals.css and the
 * contrast rules in decisions/2026-11-17-light-theme-brand-contrast.md.
 * See BRANDING.md at the repo root.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type Theme = 'light' | 'dark'
type RGB = [number, number, number]

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const themesDir = resolve(webRoot, '../packages/dify-ui/src/themes')
const outFile = resolve(webRoot, 'themes/tacit-tokens.css')

// ---------------------------------------------------------------------------
// Tacit palette
// ---------------------------------------------------------------------------

/** Dark ink used for labels on mint, in both themes (oklch(0.141 0.005 285.823)). */
const INK = '#09090b'

const BRAND = {
  light: {
    /** --color-brand-on-light: primary fill. Labels on it are INK (7.69:1). */
    fill: '#2db58f',
    fillHover: '#26a582',
    /** Thin UI marks (edges, rings, toggles, sliders) need 3:1 on white: 3.53:1. */
    mark: '#1f9a78',
    markHover: '#1c9474',
    /** --color-brand-text-on-light: mint text and links on light surfaces (5.42:1). */
    text: '#007957',
    textHover: '#006a4c',
    /** Mint used under white text (premium badges): 5.42:1 and 6.63:1. */
    deep: '#007957',
    deepHover: '#006a4c',
  },
  dark: {
    /** --color-brand: primary in the dark theme. */
    fill: '#93e8c9',
    fillHover: '#b0efd8',
    mark: '#93e8c9',
    markHover: '#b0efd8',
    text: '#93e8c9',
    textHover: '#b0efd8',
    deep: '#007957',
    deepHover: '#006a4c',
  },
} as const

/** Status colours: Tailwind 700 in light, 400 in dark; info is blue-600 / blue-400. */
const STATUS = {
  light: {
    destructive: '#b91c1c',
    destructiveSecondary: '#dc2626',
    success: '#15803d',
    successSecondary: '#16a34a',
    warning: '#b45309',
    warningSecondary: '#d97706',
    info: '#2563eb',
  },
  dark: {
    destructive: '#f87171',
    destructiveSecondary: '#f87171',
    success: '#4ade80',
    successSecondary: '#4ade80',
    warning: '#fbbf24',
    warningSecondary: '#fbbf24',
    info: '#60a5fa',
  },
} as const

// ---------------------------------------------------------------------------
// Rule 1: explicit overrides (token name without the `--color-` prefix)
// ---------------------------------------------------------------------------

const explicit = (t: Theme): Record<string, string> => {
  const b = BRAND[t]
  const s = STATUS[t]
  const light = t === 'light'
  return {
    // Labels on mint are always dark ink, never white.
    'components-button-primary-text': INK,
    'components-button-primary-text-disabled': alpha(INK, 0.4),
    'components-button-primary-bg': b.fill,
    'components-button-primary-bg-hover': b.fillHover,
    'components-button-primary-bg-disabled': alpha(b.fill, light ? 0.3 : 0.2),
    'components-checkbox-icon': INK,
    'components-checkbox-icon-disabled': alpha(INK, 0.4),
    'components-checkbox-bg': b.fill,
    'components-checkbox-bg-hover': b.fillHover,
    'components-checkbox-bg-disabled-checked': alpha(b.fill, 0.4),
    'components-radio-border-checked': b.mark,
    'components-radio-border-checked-hover': b.markHover,
    'components-radio-border-checked-disabled': alpha(b.mark, 0.4),
    'components-toggle-bg': b.mark,
    'components-toggle-bg-hover': b.markHover,
    'components-toggle-bg-disabled': alpha(b.mark, 0.3),
    'components-slider-range': b.mark,
    'components-tab-active': b.text,
    'components-option-card-option-selected-border': b.mark,
    // Prompt editor focus ring: a sky -> blue gradient upstream, mint here.
    'components-input-border-active-prompt-1': light ? '#5fd3ad' : '#c9f4e4',

    // Accent text and links.
    'text-accent': b.text,
    'text-accent-secondary': light ? b.mark : b.fill,
    'text-accent-light-mode-only': light ? b.text : '#d4d4d8',
    'text-text-selected': alpha(light ? b.fill : b.fill, light ? 0.22 : 0.3),
    'components-input-text-filled-blue': b.text,
    'components-button-secondary-accent-text': light ? b.text : b.fill,
    'components-button-secondary-accent-text-disabled': alpha(light ? b.text : b.fill, 0.4),
    'components-main-nav-text-active': light ? b.text : '#ffffff',
    'components-main-nav-nav-button-text-active': light ? b.text : '#f4f4f5',
    'workflow-test-run-text': light ? b.text : '#c9f4e4',

    // Status.
    'text-destructive': s.destructive,
    'text-destructive-secondary': s.destructiveSecondary,
    'text-success': s.success,
    'text-success-secondary': s.successSecondary,
    'text-warning': s.warning,
    'text-warning-secondary': s.warningSecondary,
    'state-destructive-solid': s.destructive,
    'state-success-solid': s.success,
    'state-warning-solid': s.warning,
    'components-button-destructive-primary-bg': light ? s.destructive : '#dc2626',
    'components-button-destructive-primary-bg-hover': light ? '#991b1b' : '#b91c1c',
    'components-badge-status-light-normal-bg': s.info,
    'components-badge-status-light-normal-border-inner': s.info,
    'components-badge-status-light-normal-halo': alpha(s.info, 0.25),

    // Brand marks (the old Dify wordmark ink) and SaaS accents.
    'components-brand-mark-ink': light ? b.text : '#ffffff',
    'components-brand-mark-ink-deep': light ? b.textHover : '#ffffff',
    'dify-logo-blue': light ? b.fill : '#e8e8e8',
    'saas-dify-blue-static': b.deep,
    'saas-dify-blue-static-hover': b.deepHover,
    'saas-dify-blue-accessible': b.text,
    'saas-dify-blue-inverted': light ? b.text : '#ffffff',
    'saas-dify-blue-inverted-dimmed': light ? b.text : alpha('#ffffff', 0.88),

    // Premium badge: white label on a deep mint gradient.
    'components-premium-badge-blue-bg-stop-0': light ? b.deep : '#007f5c',
    'components-premium-badge-blue-bg-stop-100': light ? b.deepHover : b.deep,
    'components-premium-badge-blue-stroke-stop-0': alpha('#ffffff', 0.95),
    'components-premium-badge-blue-stroke-stop-100': light ? b.deepHover : b.deep,
    'components-premium-badge-blue-text-stop-0': '#fcfcfd',
    'components-premium-badge-blue-text-stop-100': '#d6f5e9',
    'components-premium-badge-blue-glow': '#00382a',
    'components-premium-badge-blue-glow-hover': light ? '#5fd3ad' : '#c9f4e4',
    'components-premium-badge-blue-bg-stop-0-hover': light ? b.deepHover : b.deep,
    'components-premium-badge-blue-bg-stop-100-hover': '#00553f',
    'components-premium-badge-blue-stroke-stop-0-hover': alpha('#ffffff', 0.95),
    'components-premium-badge-blue-stroke-stop-100-hover': '#00553f',
  }
}

// ---------------------------------------------------------------------------
// Rule 2: brand blue -> mint
// ---------------------------------------------------------------------------

/** Token families whose colours carry meaning (node types, avatars, logos). */
const KEEP_FAMILIES = [/^util-colors-/, /^workflow-display-/, /^third-party-/, /indigo/]

/** Dify's brand-blue values (light and dark), as RGB keys. */
const BRAND_BLUE_DEEP = new Set(
  [
    '#0033ff',
    '#002cde',
    '#001ea0',
    '#0330e5',
    '#085afc',
    '#3072ff',
    '#0a68ff',
    '#3146ff',
    '#2d5abe',
    '#486cff',
    '#5c7cff',
  ].map(key),
)
const BRAND_BLUE_TINT = new Set(
  [
    '#6694ff',
    '#a0bdff',
    '#d0dfff',
    '#e9f0ff',
    '#f5f8ff',
    '#eff4ff',
    '#e5eaff',
    '#c4cfff',
    '#d2dbff',
    '#f3f5fd',
    '#e2e7fb',
    '#bac6f5',
    '#899eee',
    '#4f6de5',
    '#082bb4',
    '#07228e',
    '#051969',
    '#031042',
    '#020821',
  ].map(key),
)

type Role = 'fill' | 'mark' | 'text'

const roleFor = (name: string): Role => {
  if (/^text-|-text|-ink/.test(name)) return 'text'
  if (
    /line|handle|border|range|progress|radio|toggle|slider|chart|wave|stroke|reflection|glow/.test(
      name,
    )
  )
    return 'mark'
  return 'fill'
}

const brandBlue = (t: Theme, name: string, rgb: RGB, a: number | null): string | null => {
  const k = key(rgb)
  const b = BRAND[t]
  if (BRAND_BLUE_DEEP.has(k)) {
    const role = roleFor(name)
    const hover = /hover/.test(name)
    const base = hover ? b[`${role}Hover`] : b[role]
    return a === null ? base : alpha(base, a)
  }
  if (BRAND_BLUE_TINT.has(k)) {
    // Keep the source's perceived lightness, on the mint hue.
    const mint = toMint(rgb)
    return a === null ? mint : alpha(mint, a)
  }
  return null
}

// ---------------------------------------------------------------------------
// Rule 3: slate neutrals -> zinc
// ---------------------------------------------------------------------------

const NEUTRALS: Record<string, string> = {
  '#101828': '#09090b',
  '#18222f': '#18181b',
  '#1b1f24': '#18181b',
  '#354052': '#3f3f46',
  '#495464': '#52525b',
  '#676f83': '#65656f', // Tacit light --muted-foreground, oklch(0.53 0.016 285.938)
  '#98a2b2': '#a1a1aa',
  '#c8ceda': '#d4d4d8',
  '#d0d5dc': '#d4d4d8',
  '#e9ebf0': '#e4e4e7',
  '#f2f4f7': '#f4f4f5',
  '#f9fafb': '#fafafa',
  '#fcfcfd': '#fcfcfc',
  '#d9d9de': '#d4d4d8',
  '#fbfbfc': '#fafafa',
  '#747481': '#71717a',
}

/** Dark surfaces -> Tacit dark (background oklch(0.141…), card oklch(0.21…)). */
const DARK_SURFACES: Record<string, string> = {
  '#1d1d20': '#09090b',
  '#1f1f23': '#121215',
  '#222225': '#18181b',
  '#27272b': '#1f1f23',
  '#2c2c30': '#27272a',
  '#393a3e': '#3f3f46',
  '#3a3a40': '#3f3f46',
}

const neutral = (t: Theme, rgb: RGB, a: number | null): string | null => {
  const k = key(rgb)
  const mapped = (t === 'dark' && DARK_SURFACES[k]) || NEUTRALS[k]
  if (!mapped) return null
  return a === null ? mapped : alpha(mapped, a)
}

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

function parseColor(v: string): { rgb: RGB; a: number | null } | null {
  let m = /^#([0-9a-f]{6})$/i.exec(v)
  if (m) {
    const h = m[1]!
    return {
      rgb: [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16)) as RGB,
      a: null,
    }
  }
  m = /^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/.exec(v)
  if (m) return { rgb: [Number(m[1]), Number(m[2]), Number(m[3])], a: m[4] ? Number(m[4]) : null }
  return null
}

function hex(rgb: RGB): string {
  return `#${rgb
    .map((c) =>
      Math.round(Math.min(255, Math.max(0, c)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

function key(v: string | RGB): string {
  return typeof v === 'string' ? v.toLowerCase() : hex(v)
}

function alpha(color: string, a: number): string {
  const p = parseColor(color)!
  return `rgb(${p.rgb.join(' ')} / ${a})`
}

const srgbToLinear = (c: number) => {
  const x = c / 255
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}
const linearToSrgb = (x: number) =>
  255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.max(x, 0) ** (1 / 2.4) - 0.055)

function toOklch([r, g, b]: RGB): [number, number, number] {
  const [lr, lg, lb] = [r, g, b].map(srgbToLinear) as RGB
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [L, Math.hypot(A, B), (Math.atan2(B, A) * 180) / Math.PI]
}

function fromOklch(L: number, C: number, H: number): RGB {
  const A = C * Math.cos((H * Math.PI) / 180)
  const B = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

/** Same perceived lightness, on the Tacit mint hue, with chroma capped for gamut. */
function toMint(rgb: RGB): string {
  const [L, C] = toOklch(rgb)
  const H = 166
  let c = Math.min(C, 0.14) * 0.75
  let out = fromOklch(L, c, H)
  while (out.some((x) => x < -0.5 || x > 255.5) && c > 0) {
    c -= 0.005
    out = fromOklch(L, c, H)
  }
  return hex(out)
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

function parseTokens(file: string): [string, string][] {
  const css = readFileSync(resolve(themesDir, file), 'utf8')
  return [...css.matchAll(/--color-([\w-]+):\s*([^;\s][^;]*);/g)].map((m) => [m[1]!, m[2]!.trim()])
}

function build(t: Theme): { lines: string[]; unmapped: string[] } {
  const ex = explicit(t)
  const lines: string[] = []
  const unmapped: string[] = []
  const tokens = parseTokens(`${t}.css`)
  const names = new Set(tokens.map(([n]) => n))
  for (const n of Object.keys(ex))
    if (!names.has(n)) unmapped.push(`explicit token no longer exists: ${n}`)

  for (const [name, value] of tokens) {
    let next: string | null = ex[name] ?? null
    const parsed = parseColor(value)
    if (next === null && parsed) {
      const keep = KEEP_FAMILIES.some((re) => re.test(name))
      if (!keep) next = brandBlue(t, name, parsed.rgb, parsed.a)
      if (next === null) next = neutral(t, parsed.rgb, parsed.a)
      if (next === null && !keep && isBlue(parsed.rgb))
        unmapped.push(`blue value left as is: ${name}: ${value}`)
    }
    if (next !== null && next !== value) lines.push(`  --color-${name}: ${next};`)
  }
  return { lines, unmapped }
}

function isBlue(rgb: RGB): boolean {
  const [L, C, H] = toOklch(rgb)
  return C > 0.08 && H > 245 && H < 275 && L > 0.3
}

const header = `/* Generated by web/scripts/generate-tacit-theme.ts. Do not edit by hand.
 * Re-run after merging an upstream release:
 *   node ./scripts/generate-tacit-theme.ts
 * Overrides Dify's tokens (packages/dify-ui/src/themes) with the Tacit palette.
 */
`

const light = build('light')
const dark = build('dark')
const output = `${header}
html[data-theme='light'] {
${light.lines.join('\n')}
}

html[data-theme='dark'] {
${dark.lines.join('\n')}
}
`

const warnings = [
  ...light.unmapped.map((w) => `[light] ${w}`),
  ...dark.unmapped.map((w) => `[dark] ${w}`),
]
for (const w of warnings) console.warn(w)

if (process.argv.includes('--check')) {
  let current = ''
  try {
    current = readFileSync(outFile, 'utf8')
  } catch {}
  if (current !== output) {
    console.error(
      'web/themes/tacit-tokens.css is stale. Run: node ./scripts/generate-tacit-theme.ts',
    )
    process.exit(1)
  }
  console.log('web/themes/tacit-tokens.css is up to date.')
} else {
  writeFileSync(outFile, output)
  console.log(
    `Wrote ${outFile} (${light.lines.length} light, ${dark.lines.length} dark overrides).`,
  )
}
