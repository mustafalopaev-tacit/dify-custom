import { CssTransform, hexToRGBA, readableTextColor } from '../utils'

describe('theme value conversions', () => {
  it.each([
    ['#000000', 0, 'rgba(0,0,0,0)'],
    ['FFFFFF', 0.5, 'rgba(255,255,255,0.5)'],
    ['#12AB34', 1, 'rgba(18,171,52,1)'],
  ])('converts %s with opacity %s', (hex, opacity, expected) => {
    expect(hexToRGBA(hex, opacity)).toBe(expected)
  })

  it('parses style declarations while trimming whitespace and skipping empty pairs', () => {
    expect(CssTransform('  color : red ;; margin: 10px; ')).toEqual({
      color: 'red',
      margin: '10px',
    })
  })

  it('has no declarations for an empty style', () => {
    expect(CssTransform('')).toEqual({})
  })
})

describe('readableTextColor', () => {
  it('uses dark ink on the Tacit mint and other light fills', () => {
    expect(readableTextColor('#2DB58F')).toBe('#09090b')
    expect(readableTextColor('#93e8c9')).toBe('#09090b')
  })

  it('uses white on dark fills and when the value is not a 6-digit hex', () => {
    expect(readableTextColor('#123456')).toBe('#ffffff')
    expect(readableTextColor('#007957')).toBe('#ffffff')
    expect(readableTextColor('red')).toBe('#ffffff')
  })
})
