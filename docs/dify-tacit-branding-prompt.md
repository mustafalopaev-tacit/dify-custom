# Prompt: Re-brand Dify as Tacit (full design + logo customization)

Copy everything below the line into your AI coding agent (Claude Code, Codex, etc.), run from inside your Dify fork.

---

You are re-branding a fork of Dify (https://github.com/langgenius/dify) so that every screen a user sees looks like a Tacit product: Tacit colors, typography, logos, favicon and product name, in both light and dark themes. Dify's functionality must stay exactly the same.

**Licensing:** all good. We hold a commercial license from LangGenius that covers replacing Dify's logo, name and copyright notices, so full re-branding is approved.

## 1. Repository setup
- Work in the Dify fork in the current directory. If `upstream` isn't set: `git remote add upstream https://github.com/langgenius/dify.git`.
- Start from the latest stable release tag (not `main`), and create the branch `tacit-branding` from it.
- The frontend is `web/` (Next.js). Read `web/AGENTS.md` and `web/README.md` first, and follow their package manager, lint and test commands.

## 2. Brand source of truth (read these files, don't guess values)
Reference repo: `/Users/mustafalopaev/Desktop/WORK/tacit/development/tacit-product/tacit`

| What | File |
|---|---|
| **Design tokens (primary source)** | `core/web-ui/src/styles/globals.css`: the `@theme` block, plus `:root` (light) and `.dark` |
| Contrast rules and why | `decisions/2026-11-17-light-theme-brand-contrast.md` |
| Logo, light theme | `core/web-ui/public/icons/tacit-logo-light.svg` |
| Logo, dark theme | `core/web-ui/public/icons/tacit-logo-dark.svg` |
| Icon / app mark | `core/web-ui/public/icons/brand-icon.svg` |
| App icons (PNG) | `core/web-ui/public/icons/icon-192.png`, `icon-512.png`, `*-maskable.png`, `apple-touch-icon-*.png` |
| Logo usage (expanded vs collapsed) | `core/web-ui/src/components/shared/brand-mark.tsx` |
| Secondary reference only | `core/web-ui/docs/design-system.html` (marketing brand sheet; where it conflicts with `globals.css`, `globals.css` wins) |

Key values (confirm them against `globals.css`):
- **Brand mint:** `#93E8C9` (`--color-brand`): the primary color in the **dark** theme and on dark surfaces.
- **Brand on light:** `#2DB58F` (`--color-brand-on-light`): the primary *fill* in the **light** theme.
- **Brand text on light:** `#007957` (`--color-brand-text-on-light`): for mint-colored *text* or links on light backgrounds (`#2DB58F` fails WCAG AA as text).
- **Ink on mint:** `oklch(0.141 0.005 285.823)`. Labels on mint buttons and badges are this dark ink, **never white**, in both themes.
- **Neutrals:** zinc (shadcn zinc preset). Light background is white; dark background is `oklch(0.141 0.005 285.823)`, with cards/popovers at `oklch(0.21 0.006 285.885)`.
- **Status:** success / warning / destructive use Tailwind green / amber / red at the **700** shade in light and **400** in dark. Info is blue-600 in light and blue-400 in dark.
- **Typography:** Geist Variable (`@fontsource-variable/geist`), self-hosted, no Google Fonts. Keep the letter-spacing in the Tacit text scale (-0.01em for base to 3xl, -0.02em for 4xl and up).
- **Radius:** `--radius: 0.625rem` (10px).
- **Charts:** chart-1 is the brand mint, then emerald 400 → 700.

## 3. Scope: what to change

**A. Theme colors (light + dark)**
- Find where Dify defines its design tokens (start in `web/themes/`, `web/app/styles/`, and any Tailwind config or token files; search for the CSS variables used by primary buttons, e.g. `--color-components-button-primary-bg`, and for `data-theme`/`.dark`).
- Map Dify's semantic tokens onto the Tacit palette: primary/accent → mint (per theme, as above), neutrals → zinc, status colors → the shades above, focus rings, selection, links, toggles, sliders, checkboxes, tabs, badges, the workflow canvas (node headers, edges, selection), the chat UI and the embedded chat widget.
- Prefer a **single override file** (for example `web/themes/tacit.css`, imported last) that redefines Dify's tokens, over editing hundreds of components. Edit a component only where a color is hard-coded.
- Replace Dify's blue accents everywhere they act as the brand color. Leave colors that carry meaning (status, node-type colors, syntax highlighting) unless they clash.

**B. Typography**
- Add `@fontsource-variable/geist` and make Geist the default sans font across the console and web apps. Remove any other default sans font. Keep a monospace font for code.

**C. Logos, icons, favicon**
- Replace every Dify logo asset and component with Tacit's: `web/public/logo/*` (`logo.svg`, `logo-site.png`, `logo-site-dark.png`, `logo-embedded-chat-avatar.png`, `logo-embedded-chat-header*.png`), and `web/app/components/base/logo/*` (`dify-logo.tsx`, `logo-embedded-chat-avatar.tsx`, `logo-embedded-chat-header.tsx`).
- Use the light wordmark on light surfaces and the dark wordmark on dark ones. Where space is tight (collapsed nav, chat avatar, favicon), use `brand-icon.svg`.
- Generate the PNG sizes Dify expects from the SVGs (keep the same file names and dimensions, plus @2x/@3x where they exist).
- Replace `favicon.ico`, apple-touch icons, the PWA manifest name and icons, and Open Graph or social preview images if present.
- Search the whole `web/` tree for any other Dify mark (inline SVG paths, `dify` in image file names, icon components) and replace them.

**D. Product name and copy**
- Replace the user-visible product name "Dify" with "Tacit" in page titles and metadata (`<title>`, `description`, manifest), the sign-in and sign-up screens, the "Powered by Dify" footer in web apps and embedded chat, about/version dialogs, and empty states.
- In `web/i18n/`, change the **values** of user-facing strings in every locale that has them. Never rename i18n **keys**.
- Don't rename code identifiers, package names, API routes, env var names, Docker service names, or plugin/marketplace URLs. Those must stay so upstream merges and the backend keep working.
- Links to Dify docs, GitHub, Discord or the marketplace: list them in `BRANDING.md` and hide the community links (GitHub, Discord, roadmap). Keep functional docs links for now unless an env var already supports overriding them.
- Backend email templates (`api/templates/`, e.g. invite and password-reset emails): re-brand logo, name and colors there too.

## 4. Constraints
- **Small, contained changes.** The fork has to merge upstream releases every 1–2 weeks. Prefer new files (token override, logo assets) over edits to existing ones. Don't reformat files you don't otherwise change.
- **Accessibility:** every text/background pair must reach WCAG AA (4.5:1 for body text, 3:1 for large text and UI marks) in both themes. Follow the Tacit contrast rules above: dark ink on mint, `#007957` for mint text on light.
- No functional changes, and no new runtime dependencies other than the Geist font package.
- No fonts, images or scripts loaded from external CDNs.

## 5. Process
1. **Explore first and report.** Before editing anything, give me a short plan: where Dify's tokens live, how you'll override them, the full list of logo assets and components, and the count of "Dify" strings found per area. Wait for my OK.
2. Implement in small commits: tokens → typography → logos/icons → copy → email templates.
3. **Verify:**
   - `web/` lint, type-check, unit tests and production build all pass.
   - Run the stack locally with `docker compose` from `docker/`, using a locally built `web` image (and `api` if templates changed).
   - Screenshot these screens in **light and dark**: sign-in, app list (Studio), chatflow/workflow canvas with a node selected, app settings, a published chat web app, the embedded chat bubble, knowledge base page, account/settings dialog. Fix anything that still shows Dify blue, a Dify logo, or the name "Dify".
   - `grep -ri "dify" web/app web/i18n/en-US web/public` and review every remaining hit. Each must be a code identifier or a deliberately kept link listed in `BRANDING.md`.
   - Check contrast on primary buttons, links, badges and status text in both themes.

## 6. Deliverables
- Branch `tacit-branding` with clean commits.
- `BRANDING.md` at the repo root covering:
  - every changed or added file, and why
  - remaining Dify references that were kept on purpose
  - how to merge a new upstream release (`git fetch upstream --tags`, merge the tag, resolve conflicts, re-run the verification checklist)
- Build instructions for the custom images, tagged with the Dify version plus a suffix (e.g. `1.x.y-tacit.1`), to be pushed to AWS ECR in **eu-west-2** under the repos `tacit-dify-web` (and `tacit-dify-api` if the API image changed). **Write the commands but don't push or create ECR repos without asking me.**
- `docker/docker-compose.override.yaml` that points the `web` (and, if needed, `api`/`worker`) services at those ECR images, so the EC2 deployment only needs `docker compose pull && docker compose up -d`.
- The before/after screenshots from the verification step.
