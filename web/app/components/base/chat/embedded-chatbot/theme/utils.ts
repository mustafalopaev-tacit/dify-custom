import type { CSSProperties } from 'react'

export function hexToRGBA(hex: string, opacity: number): string {
  hex = hex.replace('#', '')

  const r = Number.parseInt(hex.slice(0, 2), 16)
  const g = Number.parseInt(hex.slice(2, 4), 16)
  const b = Number.parseInt(hex.slice(4, 6), 16)

  // Returning an RGB color object
  return `rgba(${r},${g},${b},${opacity.toString()})`
}

/**
 * Tacit re-brand: the label colour for a button filled with `hex`, dark ink or
 * white, whichever contrasts more (labels on the Tacit mint are dark ink).
 */
export function readableTextColor(hex: string): string {
  const value = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(value)) return '#ffffff'
  const channel = (i: number) => {
    const c = Number.parseInt(value.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
  const inkLuminance = 0.0027 // #09090b
  const onInk = (luminance + 0.05) / (inkLuminance + 0.05)
  const onWhite = 1.05 / (luminance + 0.05)
  return onInk >= onWhite ? '#09090b' : '#ffffff'
}

/**
 * Since strings cannot be directly assigned to the 'style' attribute in JSX,
 * this method transforms the string into an object representation of the styles.
 */
export function CssTransform(cssString: string): CSSProperties {
  if (cssString.length === 0) return {}

  const style: CSSProperties = {}
  const propertyValuePairs = cssString.split(';')
  for (const pair of propertyValuePairs) {
    if (pair.trim().length > 0) {
      const [property, value] = pair.split(':')
      Object.assign(style, { [property!.trim()]: value!.trim() })
    }
  }
  return style
}
