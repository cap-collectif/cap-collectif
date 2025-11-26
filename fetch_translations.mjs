import fs from 'fs'
import fetch from 'node-fetch'
import chalk from 'chalk'

const locales = ['fr-FR', 'es-ES', 'en-GB', 'de-DE', 'nl-NL', 'sv-SE', 'eu-EU', 'oc-OC', 'ur-IN']
const domains = ['CapcoAppBundle', 'SonataAdminBundle', 'messages']

const logger = {
  /* eslint-disable no-console */
  info: message => console.log(chalk.blue(message)),
  success: message => console.log(chalk.green(message)),
  error: message => console.error(chalk.red(message)),
  log: message => console.log(message),
  locale: locale => console.log(`[${chalk.green(locale)}]:`),
  file: path => console.log(`    ${path}`),
  /* eslint-enable no-console */
}

function getApiKey() {
  const key = process.env.SYMFONY_LOCO_READ_ONLY_KEY
  if (!key) {
    logger.error('Error: SYMFONY_LOCO_READ_ONLY_KEY environment variable is not set')
    process.exit(1)
  }
  return key
}

async function fetchFromLoco(route, options = {}) {
  const response = await fetch(`https://localise.biz/api/export/locale${route}`, {
    headers: {
      'User-Agent': 'Capco',
    },
    ...options,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorBody}`)
  }

  return response
}

async function downloadXlfFiles(locale, apiKey) {
  const response = await fetchFromLoco(`/${locale}.xlf?format=symfony&no-comments=true&key=${apiKey}`)
  const content = await response.text()

  for (const domain of domains) {
    const path = `translations/${domain}+intl-icu.${locale}.xlf`
    fs.writeFileSync(path, content)
    logger.file(path)
  }
}

async function downloadJsonFiles(locale, apiKey) {
  const response = await fetchFromLoco(`/${locale}.json?no-folding=true&no-comments=true&key=${apiKey}`)
  const json = await response.json()
  const messages = JSON.stringify(json, null, 2)

  const dir = 'public/js'
  const jsonPath = `translations/${locale}.json`
  const bundlePath = `${dir}/${locale}.js`
  const bundlePathES6 = `${bundlePath}-es6.js`

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(jsonPath, messages)
  logger.file(jsonPath)

  fs.writeFileSync(bundlePath, `window.intl_messages=${messages};`)
  logger.file(bundlePath)

  fs.writeFileSync(bundlePathES6, `export default ${messages};`)
  logger.file(bundlePathES6)
}

async function main() {
  logger.info('Fetching translations from Loco API...\n')

  const apiKey = getApiKey()

  for (const locale of locales) {
    logger.locale(locale)
    await downloadXlfFiles(locale, apiKey)
    await downloadJsonFiles(locale, apiKey)
  }
}

main()
  .then(() => logger.success('\nSuccessfully downloaded all translation files'))
  .catch(error => {
    logger.error(`\n${error.message}`)
    process.exit(1)
  })
