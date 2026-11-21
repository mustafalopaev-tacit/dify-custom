/**
 * Tacit re-brand switches. See BRANDING.md at the repo root.
 *
 * Kept in one file so upstream components only gain a one-line guard.
 */
export const TACIT_BRANDING = {
  /** Upstream community links: GitHub, Discord, roadmap, changelog, licence. */
  showCommunityLinks: false,
  /** Shown in the about dialog in place of upstream's copyright line. */
  copyrightHolder: 'Tacit',
} as const
