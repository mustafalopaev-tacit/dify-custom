/**
 * Tacit re-brand: WCAG AA contrast of the main text/background pairs, computed
 * from Dify's token files with web/themes/tacit-tokens.css applied on top.
 * Fails when a re-generation (web/scripts/generate-tacit-theme.ts) or an
 * upstream token change drops a pair below 4.5:1 (text) or 3:1 (UI marks).
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type Theme = 'light' | 'dark'
type RGBA = [number, number, number, number]

const root = resolve(__dirname, '..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

const parse = (css: string) =>
  Object.fromEntries(
    [...css.matchAll(/--color-([\w-]+):\s*([^;\s][^;]*);/g)].map((m) => [m[1]!, m[2]!.trim()]),
  )

const overrides = read('themes/tacit-tokens.css')
const [lightOverrides, darkOverrides] = overrides.split("html[data-theme='dark']")

const tokens: Record<Theme, Record<string, string>> = {
  light: { ...parse(read('../packages/dify-ui/src/themes/light.css')), ...parse(lightOverrides!) },
  dark: { ...parse(read('../packages/dify-ui/src/themes/dark.css')), ...parse(darkOverrides!) },
}

const toRGBA = (value: string): RGBA => {
  const hex = /^#([0-9a-f]{6})$/i.exec(value)
  if (hex) {
    const h = hex[1]!
    return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16)).concat(1) as RGBA
  }
  const rgb = /^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/.exec(value)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] ? Number(rgb[4]) : 1]
  throw new Error(`Unsupported colour: ${value}`)
}

const color = (theme: Theme, nameOrValue: string): RGBA =>
  toRGBA(nameOrValue.startsWith('#') ? nameOrValue : tokens[theme][nameOrValue]!)

const over = ([r, g, b, a]: RGBA, [br, bg, bb]: RGBA): RGBA => [
  r * a + br * (1 - a),
  g * a + bg * (1 - a),
  b * a + bb * (1 - a),
  1,
]

const luminance = ([r, g, b]: RGBA) => {
  const c = [r, g, b].map((v) => {
    const x = v / 255
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!
}

const contrast = (theme: Theme, fg: string, bg: string, canvas = 'background-default') => {
  const base = color(theme, canvas)
  const back = over(color(theme, bg), base)
  const front = over(color(theme, fg), back)
  const [hi, lo] = [luminance(front), luminance(back)].sort((a, b) => b - a)
  return (hi! + 0.05) / (lo! + 0.05)
}

// [foreground, background, minimum ratio]
const TEXT = 4.5
const UI = 3
const pairs: [string, string, number][] = [
  ['components-button-primary-text', 'components-button-primary-bg', TEXT],
  ['components-button-primary-text', 'components-button-primary-bg-hover', TEXT],
  ['components-checkbox-icon', 'components-checkbox-bg', UI],
  ['text-accent', 'background-default', TEXT],
  ['text-accent', 'background-body', TEXT],
  ['components-button-secondary-accent-text', 'components-button-secondary-accent-bg', TEXT],
  ['components-main-nav-text-active', 'background-body', TEXT],
  ['components-tab-active', 'background-default', TEXT],
  ['text-primary', 'background-default', TEXT],
  ['text-secondary', 'background-default', TEXT],
  ['text-tertiary', 'background-default', TEXT],
  ['text-destructive', 'background-default', TEXT],
  ['text-success', 'background-default', TEXT],
  ['text-warning', 'background-default', TEXT],
  ['components-toggle-bg', 'background-default', UI],
  ['components-slider-range', 'background-default', UI],
  ['workflow-link-line-active', 'background-default', UI],
]

describe('Tacit theme contrast (WCAG AA)', () => {
  for (const theme of ['light', 'dark'] as const) {
    it.each(pairs)(`${theme}: %s on %s`, (fg, bg, min) => {
      expect(contrast(theme, fg, bg)).toBeGreaterThanOrEqual(min)
    })
  }

  it('keeps white premium-badge labels readable on the deep mint', () => {
    for (const theme of ['light', 'dark'] as const) {
      for (const stop of ['bg-stop-0', 'bg-stop-100']) {
        expect(
          contrast(theme, '#ffffff', `components-premium-badge-blue-${stop}`),
        ).toBeGreaterThanOrEqual(TEXT)
      }
    }
  })
})
