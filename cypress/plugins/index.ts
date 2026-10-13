/// <reference types="cypress" />

// ***********************************************************
// This example plugins/index.ts can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

import fs from 'fs-extra'
import path from 'path'
import * as util from 'util'
import * as cp from 'child_process'

import { mailcatcherTasks } from './mailcatcher'

const exec = util.promisify(cp.exec)
const execFile = util.promisify(cp.execFile)

const env = process.env.CI ? 'ci' : 'local'
const castor = (group: string, task: string) => `castor ${env}:${group}:${task}`
const confirm = env === 'local' ? ' --confirm' : ''

// `capco:toggle:enable/disable` picks its Redis namespace from the Symfony kernel env passed via
// `--env`. Cypress always runs against `capco.test` (see `baseUrl` in cypress.config.ts), and
// `infrastructure/services/local/nginx/nginx.conf` forces `$symfonyEnv test` for that host (only
// `capco.dev` resolves to `dev`) — so every HTTP request Cypress triggers (page load, GraphQL
// query/mutation) is actually served under the `test` Symfony env, both locally and in CI, which
// resolves the `testfeature_toggle` Redis namespace (`config/packages/test/quandidate_toggle.yaml`).
// Toggling `dev` locally (as this used to do) writes a key the running app never reads: the flag
// silently never appears enabled to any HTTP request, even though `docker exec ... bin/console
// capco:toggle:list` reports it as active (that command inherits the container's own default env,
// `dev`, which is irrelevant to how nginx routes a `capco.test` request).
    const toggleEnvironment = 'test'

const logRestoreTimings = (output: string) => {
  output
    .split(/\r?\n/)
    .filter(line => line.includes('CI_RESTORE_TIMING '))
    .forEach(line => console.log(line.trim()))
}

type Json = Record<string, unknown>

const rootDir = path.resolve('.')
const appDir = path.resolve('..')
const appConfigPath = path.resolve(appDir, '.env')
const appLocalConfigPath = path.resolve(appDir, '.env.local')
const appTestConfigPath = path.resolve(appDir, '.env.test')
const defaultConfigPath = path.resolve(rootDir, 'cypress.json')
const environmentConfigPath = path.resolve(rootDir, `cypress.${process.env.NODE_ENV ?? 'development'}.json`)

async function readJsonFile<T extends Json>(location: string): Promise<T> {
  try {
    if (!fs.existsSync(location)) return {} as T
    return fs.readJSON(location)
  } catch {
    return Promise.resolve({} as T)
  }
}

async function parseEnvFile<T extends Json>(location: string): Promise<T> {
  try {
    if (!fs.existsSync(location)) return {} as T
    const file = await fs.readFile(location)
    const content = file.toString()
    const lines = content
      .split('\n')
      .filter(Boolean)
      .filter(line => !line.startsWith('#'))
    const final = lines.reduce<Record<string, string>>((acc, currentValue) => {
      const [key, value] = currentValue.split('=')
      acc[key] = value
      return acc
    }, {})
    return Promise.resolve(final as T)
  } catch {
    return Promise.resolve({} as T)
  }
}

const config: Cypress.PluginConfig = async (on, cypressConfig) => {
  const defaults = await readJsonFile<Cypress.ConfigOptions>(defaultConfigPath)
  const environments = await readJsonFile<Cypress.ConfigOptions>(environmentConfigPath)
  const defaultEnvironment = await parseEnvFile(appConfigPath)
  const localEnvironment = await parseEnvFile(appLocalConfigPath)
  const testEnvironment = await parseEnvFile(appTestConfigPath)
  const cypressEnvironment: Record<string, string> = {}

  for (const key of ['SYMFONY_OPENID_TEST_USERNAME', 'SYMFONY_OPENID_TEST_PASSWORD']) {
    const value = process.env[key] ?? testEnvironment[key] ?? localEnvironment[key] ?? defaultEnvironment[key]
    if (value) cypressEnvironment[key] = value
  }

  on('task', {
    'db:restore': async () => {
      console.log('Purging RabbitMQ…')
      console.time('purge_mq')
      await exec(castor('qa', 'purge-rabbitmq') + confirm)
      console.log('Successfully purged RabbitMQ !')
      console.timeEnd('purge_mq')

      console.log('Restoring database…')
      console.time('restore_db')
      const { stdout: stdoutDb, stderr: stderrDb } = await exec(castor('qa', 'restore-db') + confirm)
      logRestoreTimings(`${stdoutDb}\n${stderrDb}`)

      if (stderrDb) {
        console.error(`error: ${stderrDb}`)
      }
      console.log('Successfully restored database !')
      console.timeEnd('restore_db')

      console.log('Restoring ElasticSearch snapshot…')
      console.time('restore_es')
      const { stdout: stdoutEs, stderr: stderrEs } = await exec(castor('qa', 'restore-es-snapshot') + confirm)
      logRestoreTimings(`${stdoutEs}\n${stderrEs}`)
      if (stderrEs) {
        console.error(`error: ${stderrEs}`)
      }
      console.log('Successfully restored ES !')
      console.timeEnd('restore_es')

      return Promise.resolve(null)
    },
    'swarrot:consume': async (name: string) => {
      console.log(`Consumming swarrot "${name}"...`)
      exec(`${castor('app', 'swarrot-consume')} ${name}`)
      return Promise.resolve(null)
    },
    'enable:feature': async (name: string) => {
      console.log(`Enabling feature flag "${name}"...`)
      console.time('enable_feature')

      await exec(`${castor('app', 'toggle-enable')} --toggle=${name} --environment=${toggleEnvironment}`)
      console.log(`Successfully enabled "${name}"`)
      console.timeEnd('enable_feature')
      return Promise.resolve(null)
    },
    'disable:feature': async (name: string) => {
      console.log(`Disabling feature flag "${name}"...`)
      console.time('disable_feature')

      await exec(`${castor('app', 'toggle-disable')} --toggle=${name} --environment=${toggleEnvironment}`)
      console.log(`Successfully disabled "${name}"`)
      console.timeEnd('enable_disable')
      return Promise.resolve(null)
    },
    'run:sql': async (sql: string) => {
      console.log(`${castor('app', 'sql')} --sql=<redacted> --environment=test`)
      await execFile('castor', [`${env}:app:sql`, `--sql=${sql}`, '--environment=test'])
      return Promise.resolve(null)
    },
    'run:command': async (name: string) => {
      console.log(`Run command "${name}"...`)
      console.time('run_command')

      await execFile('castor', [`${env}:app:cmd`, `--command-name=${name}`, '--environment=test'])
      console.log(`Successfully run command "${name}"`)
      console.timeEnd('run_command')
      return Promise.resolve(null)
    },
    ...mailcatcherTasks,
  })
  on('before:run', async () => {
    if (process.env.CI_SHARED_TEST_DATA === '1') return

    console.log('Saving database…')
    console.time('save_db')
    const { stderr: stderrDb } = await exec(castor('qa', 'save-db'))

    if (stderrDb) {
      console.error(`error: ${stderrDb}`)
    }
    console.log('Successfully saved database')
    console.timeEnd('save_db')

    console.log('Writing ElasticSearch snapshot…')
    console.time('save_es')
    const { stderr: stderrEs } = await exec(castor('qa', 'save-es-snapshot'))

    if (stderrEs) {
      console.error(`error: ${stderrEs}`)
    }
    console.log('Successfully saved ElasticSearch snapshot')
    console.timeEnd('save_es')
  })
  return {
    ...defaults,
    ...environments,
    env: {
      ...cypressConfig.env,
      ...cypressEnvironment,
    },
  }
}

module.exports = config
