# Tacit branding of this Dify fork

This fork rebrands Dify **1.20.0** as Tacit: colours, typography, logos, favicon and product name, in light and dark themes, in the console, the published web apps, the embedded chat and the emails. Dify's behaviour is unchanged. LangGenius's commercial licence covers replacing Dify's logo, name and copyright notices.

The fork is merged with each upstream release (every 1–2 weeks), so the changes are kept small. Most of the work is in new files, and the edits to upstream files are one-line hooks wherever possible.

- Branch: `tacit-branding`, cut from the upstream tag `1.20.0`
- Image tag: `1.20.0-tacit.1` (`<dify version>-tacit.<n>`)
- Brand source of truth: `tacit/core/web-ui/src/styles/globals.css` (tokens), `decisions/2026-11-17-light-theme-brand-contrast.md` (contrast rules), `core/web-ui/public/icons/*` (logos)

## How the theme works

Dify's design tokens are generated upstream in `packages/dify-ui/src/themes/{light,dark}.css` (719 variables per theme, "do not edit by hand"). Instead of editing them, the fork loads two extra stylesheets after them:

| File | What it does |
|---|---|
| `web/themes/tacit-tokens.css` | **Generated** by `web/scripts/generate-tacit-theme.ts`. Re-maps Dify's semantic tokens: brand blue → Tacit mint by role, slate neutrals → zinc, status colours → Tailwind 700 (light) / 400 (dark). Re-run it after every upstream merge. |
| `web/themes/tacit.css` | Hand-written. Imports the generated file, overrides the Tailwind `primary-*` palette, sets Geist as `--font-sans` with the Tacit letter-spacing, and replaces the blue gradients from `themes/manual-*.css`. |

The mint is used in three roles, chosen to meet the contrast rules:

| Role | Light | Dark | Used for |
|---|---|---|---|
| Fill | `#2DB58F` (hover `#26A582`) | `#93E8C9` (hover `#B0EFD8`) | Primary buttons, checkboxes; **labels on it are dark ink `#09090B`, never white** |
| Mark | `#1F9A78` (3.53:1 on white) | `#93E8C9` | Toggles, sliders, radios, workflow edges and handles, rings |
| Text | `#007957` | `#93E8C9` | Accent text, links, active tabs and nav items |

The generator's rules, in order:

1. An explicit table of tokens (button, checkbox, toggle, tab, accent text, status, premium badge, brand-mark ink).
2. Any other token holding one of Dify's brand-blue values becomes mint. The role comes from the token's name: text, mark, or fill. Light tints keep their lightness on the mint hue.
3. Dify's slate neutrals map to zinc. In dark, the surfaces map to the Tacit canvas: body `#09090B`, panels `#18181B`.

The generator never touches families that carry meaning: `util-colors-*` (node types, app icons), `workflow-display-*`, `third-party-*`, or anything indigo. It prints a warning for any blue value it leaves alone, so new upstream tokens show up after a merge.

## Changed and added files

### Theme (commit "re-brand theme tokens")
| File | Why |
|---|---|
| `web/scripts/generate-tacit-theme.ts` (new) | Generates `tacit-tokens.css`; `--check` fails if it is stale |
| `web/themes/tacit-tokens.css` (new, generated) | Token overrides |
| `web/themes/tacit.css` (new) | Palette, font, gradients |
| `web/app/styles/tailwind-core.css` | One `@import` of `tacit.css` at the end |
| `web/public/embed.js`, `embed.min.js` | Default chat bubble colour `#155EEF` → `#007957` (white icon, 5.4:1) |
| `web/app/components/base/chat/embedded-chatbot/theme/theme.ts` (+ spec) | Default chat colour → mint; header gradient → deep mint |
| `packages/dify-ui/src/spinner/index.tsx` | Hard-coded blue → `text-text-accent` |
| `web/app/components/base/zendesk/theme.ts` | Support widget colours → mint fills with dark ink labels (added when merging into `main`) |
| Hard-coded blues → tokens or mint | `workflow/style.css`, `workflow/custom-connection-line.tsx`, `workflow/panel/workflow-preview.tsx`, `base/agent-log-modal/detail.tsx`, `base/chat/chat/loading-anim/style.module.css`, `base/audio-gallery/AudioPlayer.tsx`, `base/premium-badge/index.css`, `base/voice-input/index.module.css`, `app/configuration/**` (var highlight, var picker, automatic), `app/overview/embedded/style.module.css`, `apps/list.tsx`, `integrations/plugin-category-page.tsx`, `datasets/create/**` (step two, uploaders, icons), `datasets/documents/**` (uploaders), `billing/*/style.module.css`, `custom/style.module.css`, `tools/marketplace/index.tsx`, `features/new-rag/**` (cards, chart), `features/skills/detail/builder-panel.tsx` |

### Typography (commit "use Geist Variable")
| File | Why |
|---|---|
| `pnpm-workspace.yaml`, `web/package.json`, `pnpm-lock.yaml` | Adds `@fontsource-variable/geist` 5.3.0 (self-hosted, the only new dependency) |
| `web/app/layout.tsx` | `import '@fontsource-variable/geist'` |

### Logos and icons (commit "replace Dify logos")
| File | Why |
|---|---|
| `web/app/components/base/logo/dify-logo.tsx` | Renders the Tacit wordmark inline, so the grey marks and the lettering follow `[data-theme=dark]`. The export name `DifyLogo` is kept so call sites and upstream merges don't change. |
| `web/public/logo/logo.svg`, `logo-dark.svg`, `brand-icon.svg` | Tacit SVGs (light and dark wordmarks, app icon) |
| `web/public/logo/logo-site.png` (192×84), `logo-site-dark.png` (192×86) | Wordmark PNGs, same names and sizes as before |
| `web/public/logo/logo-embedded-chat-avatar.png` (80), `logo-embedded-chat-header{,@2x,@3x}.png` (48/96/144) | Brand icon |
| `web/public/favicon.ico` (16–64 px), `web/public/apple-touch-icon.png` (180) | Brand icon; the apple icon is added to the default metadata in `app/layout.tsx` |

### Name and copy (commit "rename the product to Tacit")
| File | Why |
|---|---|
| `web/scripts/tacit-rebrand-i18n.ts` (new) | Replaces "Dify" with "Tacit" in the **values** of all 25 locales (keys untouched); `--check` reports anything still to do. It skips the strings listed under "Kept on purpose". |
| `web/i18n/locales/*/*.json`, `web/i18n/resources.generated.d.ts` | Its output: 1,102 values. The types are regenerated with `pnpm -C web i18n:generate-types`. |
| `web/utils/document-title.ts`, `web/app/components/main-nav/index.tsx`, `web/app/account/(commonLayout)/header.tsx` | Default page title and nav fallback: "Tacit" |
| `alt="Dify"` → `alt="Tacit"` | Every `DifyLogo` call site (auth shell, about dialog, web-app sidebars, embedded chat, powered-by, pricing, education, access error, marketplace description) |
| `web/app/components/workflow/{block-selector/blocks.tsx,utils/gen-node-meta-data.ts}` | Built-in node author: "Tacit" |
| `web/config/tacit-branding.ts` (new) | `TACIT_BRANDING.showCommunityLinks` (false) and `copyrightHolder` ("Tacit") |
| `main-nav/components/help-menu.tsx`, `support-menu.tsx`, `help-menu/account-about-dialog.tsx` | GitHub, Discord, roadmap, changelog and licence links are hidden behind the flag; the about dialog shows "© Tacit" |
| `web/app/components/auth-shell/index.tsx`, `web/features/app-access-error/page.tsx` | Footer: "© <year> Tacit. All rights reserved." |
| `base/chat/embedded-chatbot/theme/{theme,utils}.ts`, chat `operation.tsx`, both `inputs-form/index.tsx` | Chat buttons are painted with the chat theme colour. Their label is now dark ink or white, whichever contrasts more (`readableTextColor`), so it stays readable on the mint and on custom chat colours. |

### Emails (commit "re-brand email templates")
| File | Why |
|---|---|
| `api/templates/*.html`, `api/templates/without-brand/*.html` (61 files) | Tacit name, logo and colours. Buttons use mint `#2DB58F` with dark ink labels, links use `#007957`, slate neutrals become zinc. |
| `web/public/logo/logo-email.png` (new, 240×66) | Email logo, served by the web image. Templates load it from `{{ config.CONSOLE_WEB_URL }}/logo/logo-email.png`, so **`CONSOLE_WEB_URL` must be the public console URL**. |
| `api/libs/email_i18n.py` | Default `application_title` "Tacit"; the account-deletion and knowledge-base subjects say Tacit |
| `api/tests/unit_tests/libs/test_email_i18n.py` | Expects the Tacit title and subjects |

### Tests and deployment
| File | Why |
|---|---|
| `web/__tests__/tacit-theme-contrast.spec.ts` (new) | Computes WCAG AA contrast of the main pairs from the tokens in both themes |
| 25 web specs | Expect the "– Tacit" title suffix, the Tacit logo name, and the hidden community links |
| `docker/docker-compose.override.yaml` (new, force-added) | Points `api`, `api_websocket`, `worker`, `worker_beat`, `worker_knowledge_fs_upgrade` and `web` at the ECR images. Upstream's `.gitignore` ignores this file name, so it was added with `git add -f`. |
| `docs/branding/screenshots/{before,after}/` | Verification screenshots |
| `BRANDING.md` | This file |

## Kept on purpose (remaining "Dify" references)

**Code identifiers.** Component, file, package, env-var, API-route, Docker-service and i18n-key names stay as they are, for example `DifyLogo`, `difyChatbotConfig`, `dify-chatbot-bubble-button`, `learnDify`, `langgenius/*` packages and `X-Dify-*` headers. Renaming them would break upstream merges and the backend. Most of the ~6,000 hits from `grep -ri dify web/app web/i18n/locales/en-US web/public` are identifiers like these.

**User-visible strings kept because they name a real Dify service or identifier:**

| Where | Text | Why |
|---|---|---|
| `plugin.json` | "Dify Marketplace", "Verified by Dify", "Verified by a Dify partner", marketplace hero subtitle | Plugins still come from marketplace.dify.ai |
| `plugin.json:difyVersionNotCompatible` | "The current Dify version…" | Plugins declare a minimum *Dify* version |
| Marketplace `aria-label="Dify Marketplace"`, `public/marketplace/dify-marketplace-logo.svg` | | Same |
| `tools.json:mcp.modal.forwardUserIdentityTip` | `X-Dify-SSO-Token`, "Dify Enterprise SSO" | Real header and product |
| `login.json:license*` | Dify Community/Enterprise licence messages | They refer to Dify's licence and licence server |
| `oauth.json:tips.*` | "Dify Cloud account" | Dify Cloud OAuth |
| `agent-v-2.json:…previewDisabledTip` | "Dify Cloud and Enterprise" | Dify editions |
| `app-overview.json` | "Dify-WebClient", "Install Dify Chatbot Chrome Extension", "see Dify's Privacy Policy" | Real repo, extension and policy link; `app/overview/customize/index.tsx` also keeps `'<Web API Key From Dify>'` for the same WebClient setup |
| `billing.json`, `education.json` (all locales) | Dify Cloud plans and the education programme | Only shown on Dify Cloud |
| `workflow-human-input.json:…contactTip2`, emails `change_mail_completed_*`, `transfer_workspace_*_notify_*` | `support@dify.ai` | **Needs a decision:** replace it with a Tacit support address once there is one |

**Links (functional, kept):**
- Documentation links (`docs.dify.ai`, built by `docLink`)
- The marketplace and Creator Center (`marketplace.dify.ai`, `creators.dify.ai`)
- Dify Cloud links on Cloud-only screens (`cloud.dify.ai`, `dify.ai/privacy`, `dify.ai/terms`, pricing)

**Links (hidden behind `TACIT_BRANDING.showCommunityLinks`):**
- GitHub (`github.com/langgenius/dify`, plus the star counter)
- Discord (`discord.gg/5AEfbxcd9k`)
- Roadmap (`roadmap.dify.ai`)
- Changelog (`github.com/langgenius/dify/releases`)
- Open-source licence

**Other known leftovers:**
- The about dialog's version number and the "Tacit X is the latest version" message use Dify's version, for example 1.20.0.
- `packages/iconify-collections/assets/public/common/dify.svg` is an icon that no screen uses.
- `api/services/account/oauth_service.py` falls back to the account name "Dify" when an identity provider sends no name.
- `KNOWLEDGE_FS_WORKER_IMAGE` (an optional knowledge-fs profile) still defaults to `langgenius/dify-api`. Set it to the Tacit api image if you enable that profile.
- The Tailwind `primary-*` utilities are not theme-aware. `text-primary-600` is `#007957`, which reads 5.4:1 on white but only 3.3:1 on the dark canvas. A few legacy screens use it, the same way upstream used blue there.

## Merging a new upstream release

```bash
git fetch upstream --tags
git switch tacit-branding
git merge <new-tag>            # e.g. 1.21.0
```

1. Resolve conflicts. They are usually the one-line hooks listed above. For generated files, take upstream's version and regenerate:
   - `web/i18n/locales/**` and `web/i18n/resources.generated.d.ts`: take theirs, then step 2.
   - `pnpm-lock.yaml`: take theirs, then `pnpm install`.
2. Re-apply the generated parts (Node version from `package.json` `engines`, currently 24.22.3):

   ```bash
   pnpm install
   node web/scripts/generate-tacit-theme.ts      # read any "blue value left as is" warnings
   node web/scripts/tacit-rebrand-i18n.ts
   pnpm -C web i18n:generate-types
   ```

   If a warning names a new token that acts as the brand colour, add it to `explicit()` in the generator and run the generator again.
3. Look for new hard-coded blues or Dify marks in the merged diff:

   ```bash
   git diff <old-tag> <new-tag> -- web | grep -iE '#(0033ff|155eef|155aef|2970ff|296dff|1c64f2|2563eb)|rgba?\((0, ?51, ?255|21, ?94, ?239)|Dify'
   ```

4. Run the verification checklist below, bump the image suffix (`1.21.0-tacit.1`), build and push.

## Verification checklist

- `pnpm lint:oxlint:quiet`, `pnpm lint:tailwind --quiet`, `pnpm lint:eslint:quiet` (repo root)
- `pnpm -C web type-check`, `pnpm -C web i18n:check`
- `pnpm -C web test -- --maxWorkers=4` (unit) and `pnpm -C web test:browser -- --maxWorkers=3`
- `node web/scripts/generate-tacit-theme.ts --check` and `node web/scripts/tacit-rebrand-i18n.ts --check`
- `uv run --project api --group dev python -m pytest tests/unit_tests/libs/test_email_i18n.py`
- Build the images (the web image runs the production `next build`), start the stack, then screenshot these screens in light and dark: sign-in, Studio, a chatflow canvas with a node selected, app settings, the published chat web app, the embedded chat bubble, knowledge, and the account/settings dialog
- `grep -ri dify web/app web/i18n/locales/en-US web/public`: every remaining user-visible hit must be in "Kept on purpose"

Results for `1.20.0-tacit.1`: lint, type-check and i18n check are clean.
- Unit tests: 1,898 files and 15,536 tests pass.
- Browser tests: 417 files run. In the final full run, one test failed under load: `features/new-rag/sources/__tests__/edit-metadata.browser.spec.tsx`. It passes 3/3 when run alone and has nothing to do with the branding.
- The api email tests pass, and both images build. Contrast from `web/__tests__/tacit-theme-contrast.spec.ts`:

| Pair | Light | Dark |
|---|---|---|
| Primary button label | 7.69:1 | 13.86:1 |
| Primary button label (hover) | 6.43:1 | 15.33:1 |
| Accent text / links on panel | 5.42:1 | 12.34:1 |
| Accent text on page | 4.93:1 | 13.86:1 |
| Active tab | 5.42:1 | 12.34:1 |
| Body text (tertiary) | 5.76:1 | 5.07:1 |
| Destructive text | 6.47:1 | 6.40:1 |
| Success text | 5.02:1 | 10.17:1 |
| Warning text | 5.02:1 | 10.61:1 |
| Toggle (on) vs panel | 3.53:1 | 12.34:1 |
| Workflow edge (active) vs canvas | 3.53:1 | 12.34:1 |
| Premium badge label | 5.42:1 | 5.01:1 |

## Build and publish the images (AWS ECR, eu-west-2)

The EC2 host is an m7i.xlarge (Intel), so the images are built for `linux/amd64`. Run these from the repository root. **They have not been run.** Creating the repositories and pushing need your go-ahead.

```bash
export AWS_REGION=eu-west-2
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
export TAG=1.20.0-tacit.1

# Once: create the repositories
aws ecr create-repository --region $AWS_REGION --repository-name tacit-dify-web \
  --image-scanning-configuration scanOnPush=true --image-tag-mutability IMMUTABLE
aws ecr create-repository --region $AWS_REGION --repository-name tacit-dify-api \
  --image-scanning-configuration scanOnPush=true --image-tag-mutability IMMUTABLE

# Log in, build and push
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin $REGISTRY
docker buildx build --platform linux/amd64 -f web/Dockerfile \
  -t $REGISTRY/tacit-dify-web:$TAG --push .
docker buildx build --platform linux/amd64 -f api/Dockerfile \
  -t $REGISTRY/tacit-dify-api:$TAG --push .
```

The api image also runs `worker`, `worker_beat` and `api_websocket`.

## Deploy on the EC2 host

`docker/docker-compose.override.yaml` swaps the web and api images. Docker Compose loads it automatically. In `docker/.env` on the host, set:

```bash
TACIT_ECR_REGISTRY=<aws-account-id>.dkr.ecr.eu-west-2.amazonaws.com
TACIT_IMAGE_TAG=1.20.0-tacit.1
CONSOLE_WEB_URL=https://<console host>   # also used for the email logo
```

Then deploy:

```bash
cd docker
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin $TACIT_ECR_REGISTRY
docker compose pull && docker compose up -d
```

If the instance role can pull from ECR, use the `amazon-ecr-credential-helper` and skip the `docker login`.
