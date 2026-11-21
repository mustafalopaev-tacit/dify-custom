import { hexToRGBA, readableTextColor } from './utils'

export type Theme = Readonly<{
  chatColorTheme: string | null
  chatColorThemeInverted: boolean
  primaryColor: string
  primaryForegroundColor: string
  backgroundHeaderColorStyle: string
  headerBorderBottomStyle: string
  colorFontOnHeaderStyle: string
  colorPathOnHeader: string
  backgroundButtonDefaultColorStyle: string
  roundedBackgroundColorStyle: string
  chatBubbleColorStyle: string
}>

export const createTheme = (
  chatColorTheme: string | null = null,
  chatColorThemeInverted = false,
): Theme => {
  const hasCustomColor = chatColorTheme !== null && chatColorTheme !== ''
  const primaryColor = hasCustomColor ? chatColorTheme : '#2DB58F'
  const colorFontOnHeaderStyle = chatColorThemeInverted ? `color: ${primaryColor}` : 'color: white'

  return Object.freeze({
    chatColorTheme,
    chatColorThemeInverted,
    primaryColor,
    primaryForegroundColor: readableTextColor(primaryColor),
    backgroundHeaderColorStyle: chatColorThemeInverted
      ? 'backgroundColor: #ffffff'
      : hasCustomColor
        ? `backgroundColor: ${primaryColor}`
        : 'backgroundImage: linear-gradient(to right, #006a4c, #007957)',
    headerBorderBottomStyle: chatColorThemeInverted ? 'borderBottom: 1px solid #ccc' : '',
    colorFontOnHeaderStyle,
    colorPathOnHeader: chatColorThemeInverted ? primaryColor : 'text-text-primary-on-surface',
    backgroundButtonDefaultColorStyle: hasCustomColor
      ? `backgroundColor: ${primaryColor}; color: color: white;`
      : 'backgroundColor: #2DB58F',
    roundedBackgroundColorStyle: hasCustomColor
      ? `backgroundColor: ${hexToRGBA(primaryColor, 0.05)}`
      : 'backgroundColor: rgb(242 252 248)',
    chatBubbleColorStyle: hasCustomColor ? `backgroundColor: ${hexToRGBA(primaryColor, 0.15)}` : '',
  })
}
