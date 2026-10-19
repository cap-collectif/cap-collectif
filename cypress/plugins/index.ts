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
const confirm = ' --confirm'

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

  let featureFlagOverrides: Record<string, boolean> = {}
  const prepareFeatureFlags = async (overrides: Record<string, boolean>) => {
    await execFile('castor', [`${env}:qa:reset-feature-flags`, `--overrides=${JSON.stringify(overrides)}`])
    featureFlagOverrides = { ...overrides }
    return null
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
      if (!/^[a-zA-Z0-9_.:-]+$/.test(name)) throw new Error('Invalid consumer name.')
      const deadline = Date.now() + 30000

      // Wait for acknowledgements instead of leaving a consumer running across DB resets.
      do {
        const { stdout } = await execFile(
          'docker',
          [
            'exec',
            'capco_application_1',
            'rabbitmqctl',
            'list_queues',
            '--vhost=capco',
            'name',
            'messages_ready',
            'messages_unacknowledged',
            '--formatter=json',
          ],
          { timeout: 10000 },
        )
        const queues = JSON.parse(stdout) as Array<{
          name: string
          messages_ready: number
          messages_unacknowledged: number
        }>
        const queue = queues.find(queue => queue.name === name)
        if (!queue) throw new Error(`Queue "${name}" does not exist.`)
        if (queue.messages_ready === 0 && queue.messages_unacknowledged === 0) return null

        if (queue.messages_ready > 0) {
          await execFile(
            'castor',
            [
              `${env}:app:console`,
              `--command-name=swarrot:consume:${name}`,
              '--environment=test',
              '--',
              name,
              `--max-messages=${queue.messages_ready}`,
              '--max-execution-time=10',
              '--no-retry',
              '--no-interaction',
            ],
            { timeout: 15000 },
          )
        } else {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } while (Date.now() < deadline)

      throw new Error(`Queue "${name}" did not finish processing within 30 seconds.`)
    },
    'reset:feature-flags': async (overrides: Record<string, boolean> = {}) => {
      console.time('reset_feature_flags')
      await prepareFeatureFlags(overrides)
      console.timeEnd('reset_feature_flags')
      return null
    },
    'set:feature-flags': async (overrides: Record<string, boolean>) =>
      prepareFeatureFlags({ ...featureFlagOverrides, ...overrides }),
    'enable:feature': async (name: string) => {
      return prepareFeatureFlags({ ...featureFlagOverrides, [name]: true })
    },
    'disable:feature': async (name: string) => {
      return prepareFeatureFlags({ ...featureFlagOverrides, [name]: false })
    },
    'run:sql': async (sql: string) => {
      console.log(`${castor('app', 'console')} --command-name=doctrine:query:sql --environment=test -- <redacted>`)
      await execFile('castor', [
        `${env}:app:console`,
        '--command-name=doctrine:query:sql',
        '--environment=test',
        '--',
        sql,
      ])
      return Promise.resolve(null)
    },
    'run:command': async (name: string) => {
      console.log(`Run command "${name}"...`)
      console.time('run_command')

      await execFile('castor', [`${env}:app:console`, `--command-name=${name}`, '--environment=test'])
      console.log(`Successfully run command "${name}"`)
      console.timeEnd('run_command')
      return Promise.resolve(null)
    },
    ...mailcatcherTasks,
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
