import type { ResolvedTheme } from '@/features/theme/theme'

export function getAppliedTheme(): ResolvedTheme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

// Zendesk renders in its own iframe and expects concrete CSS colors.
// Tacit re-brand: mint fills with dark ink labels (see BRANDING.md).
export const zendeskThemes = {
  light: {
    primary: '#2db58f',
    onPrimary: '#09090b',
    action: '#2db58f',
    onAction: '#09090b',
    background: '#ffffff',
    onBackground: '#101828',
    message: '#2db58f',
    onMessage: '#09090b',
    businessMessage: '#f2f4f7',
    onBusinessMessage: '#101828',
    card: '#f9fafb',
    onCard: '#101828',
    input: '#f9fafb',
    onInput: '#101828',
    elevated: '#ffffff',
    onElevated: '#101828',
    onSecondaryAction: '#007957',
  },
  dark: {
    primary: '#93e8c9',
    onPrimary: '#09090b',
    action: '#93e8c9',
    onAction: '#09090b',
    background: '#222225',
    onBackground: '#fbfbfc',
    message: '#93e8c9',
    onMessage: '#09090b',
    businessMessage: '#3a3a40',
    onBusinessMessage: '#fbfbfc',
    card: '#27272b',
    onCard: '#fbfbfc',
    input: '#27272b',
    onInput: '#fbfbfc',
    elevated: '#3a3a40',
    onElevated: '#fbfbfc',
    onSecondaryAction: '#93e8c9',
  },
} satisfies Record<ResolvedTheme, Record<string, string>>

export type ZendeskTheme = (typeof zendeskThemes)[ResolvedTheme]
