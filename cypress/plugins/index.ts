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

const exec = util.promisify(cp.exec)

const env = process.env.CI ? 'ci' : 'local'

type Json = Record<string, unknown>

const rootDir = path.resolve('.')
const appDir = path.resolve('..')
const appConfigPath = path.resolve(appDir, '.env')
const appLocalConfigPath = path.resolve(appDir, '.env.local')
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

  on('task', {
    'db:restore': async () => {
      console.log('Purging RabbitMQ…')
      console.time('purge_mq')
      await exec(`fab ${env}.qa.purge-rabbitmq`)
      console.log('Successfully purged RabbitMQ !')
      console.timeEnd('purge_mq')

      console.log('Restoring database…')
      console.time('restore_db')
      const { stderr: stderrDb } = await exec(`fab ${env}.qa.restore-db`)

      if (stderrDb) {
        console.error(`error: ${stderrDb}`)
      }
      console.log('Successfully restored database !')
      console.timeEnd('restore_db')

      console.log('Restoring ElasticSearch snapshot…')
      console.time('restore_es')
      const { stderr: stderrEs } = await exec(`fab ${env}.qa.restore-es-snapshot`)
      if (stderrEs) {
        console.error(`error: ${stderrEs}`)
      }
      console.log('Successfully restored ES !')
      console.timeEnd('restore_es')

      return Promise.resolve(null)
    },
    'enable:feature': async (name: string) => {
      console.log(`Enabling feature flag "${name}"...`)
      console.time('enable_feature')

      await exec(`fab ${env}.app.toggle-enable --toggle=${name} --environment=test`)
      console.log(`Successfully enabled "${name}"`)
      console.timeEnd('enable_feature')
      return Promise.resolve(null)
    },
    'disable:feature': async (name: string) => {
      console.log(`Disabling feature flag "${name}"...`)
      console.time('disable_feature')

      await exec(`fab ${env}.app.toggle-disable --toggle=${name} --environment=test`)
      console.log(`Successfully disabled "${name}"`)
      console.timeEnd('enable_disable')
      return Promise.resolve(null)
    },
    'run:command': async (name: string) => {
      console.log(`Run command "${name}"...`)
      console.time('run_command')

      await exec(`fab ${env}.app.cmd --commandName=${name} --environment=test`)
      console.log(`Successfully run command "${name}"`)
      console.timeEnd('run_command')
      return Promise.resolve(null)
    },
  })
  on('before:run', async () => {
    console.log('Saving database…')
    console.time('save_db')
    const { stderr: stderrDb } = await exec(`fab ${env}.qa.save-db`)

    if (stderrDb) {
      console.error(`error: ${stderrDb}`)
    }
    console.log('Successfully saved database')
    console.timeEnd('save_db')

    console.log('Writing ElasticSearch snapshot…')
    console.time('save_es')
    const { stderr: stderrEs } = await exec(`fab ${env}.qa.save-es-snapshot`)

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
      ...defaultEnvironment,
      ...localEnvironment,
    },
  }
}

module.exports = config
