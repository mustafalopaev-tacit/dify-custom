/**
 * Tacit re-brand: replace the product name "Dify" with "Tacit" in the values of
 * every locale under i18n/locales. Keys are never touched.
 *
 *   node ./scripts/tacit-rebrand-i18n.ts          # rewrite locale files
 *   node ./scripts/tacit-rebrand-i18n.ts --check  # fail if a value still needs it
 *
 * Re-run after merging an upstream release. Strings that name a real Dify
 * product, service or identifier are kept on purpose (KEEP below, BRANDING.md).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const localesDir = resolve(dirname(fileURLToPath(import.meta.url)), '../i18n/locales')

/** Whole namespaces about Dify Cloud billing and the Dify education programme. */
const KEEP_FILES = new Set(['billing.json', 'education.json'])

/** `file:key` pairs whose "Dify" names a real Dify product, service or identifier. */
const KEEP = new Set([
  'oauth.json:tips.loggedIn', // Dify Cloud account
  'oauth.json:tips.notLoggedIn',
  'plugin.json:difyVersionNotCompatible', // plugins declare a minimum Dify version
  'plugin.json:marketplace.difyMarketplace', // marketplace.dify.ai
  'plugin.json:marketplace.home.heroSubtitle',
  'plugin.json:marketplace.partnerTip',
  'plugin.json:marketplace.verifiedTip',
  'tools.json:mcp.modal.forwardUserIdentityTip', // X-Dify-SSO-Token header, Dify Enterprise SSO
  'login.json:license.tip', // Dify's open-source licence
  'login.json:licenseExpiredTip', // Dify Enterprise licence server
  'login.json:licenseInactiveTip',
  'login.json:licenseLostTip',
  'app-overview.json:overview.appInfo.customize.way1.step1Operation', // Dify-WebClient repo
  'app-overview.json:overview.appInfo.embedded.chromePlugin', // Dify's Chrome extension
  'app-overview.json:overview.appInfo.settings.more.privacyPolicyTip', // links Dify's policy
  'agent-v-2.json:agentDetail.configure.rightPanel.previewDisabledTip', // Dify Cloud / Enterprise
])

const LINE = /^(\s*"((?:[^"\\]|\\.)*)":\s*")((?:[^"\\]|\\.)*)("\s*(?:,\s*)?)$/
// "Dify" or the German genitive "Difys", not inside identifiers like X-Dify-SSO or Difyctl.
const NAME = /(?<![\w-])Dify(s?)(?![\w-])/g

const check = process.argv.includes('--check')
let changed = 0
const pending: string[] = []

for (const locale of readdirSync(localesDir)) {
  const dir = join(localesDir, locale)
  let files: string[]
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  } catch {
    continue
  }
  for (const file of files) {
    if (KEEP_FILES.has(file)) continue
    const path = join(dir, file)
    const src = readFileSync(path, 'utf8')
    let fileChanged = false
    const out = src
      .split('\n')
      .map((line) => {
        const m = LINE.exec(line)
        if (!m) return line
        const [, head, key, value, tail] = m
        if (KEEP.has(`${file}:${key}`) || !NAME.test(value!)) return line
        NAME.lastIndex = 0
        fileChanged = true
        changed++
        pending.push(`${locale}/${file}: ${key}`)
        return `${head}${value!.replace(NAME, 'Tacit$1')}${tail}`
      })
      .join('\n')
    if (fileChanged && !check) writeFileSync(path, out)
  }
}

if (check) {
  if (pending.length) {
    console.error(`${pending.length} locale values still say "Dify":\n${pending.join('\n')}`)
    console.error('Run: node ./scripts/tacit-rebrand-i18n.ts')
    process.exit(1)
  }
  console.log('Locale values are re-branded.')
} else {
  console.log(`Re-branded ${changed} locale values.`)
}
