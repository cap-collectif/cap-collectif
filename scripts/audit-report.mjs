#!/usr/bin/env node
/* eslint-disable no-console */
// Parses `yarn npm audit --json` output (NDJSON) and prints a readable,
// severity-sorted table. Deprecation notices (no advisory URL) are excluded
// by default since they aren't security vulnerabilities.
import { spawn } from 'node:child_process'

const SEVERITY_ORDER = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 }
const SEVERITY_COLOR = {
  critical: '\x1b[41m\x1b[97m', // white on red
  high: '\x1b[31m', // red
  moderate: '\x1b[33m', // yellow
  low: '\x1b[36m', // cyan
  info: '\x1b[90m', // grey
}
const RESET = '\x1b[0m'

const includeDeprecations = process.argv.includes('--all')
const minSeverityArg = process.argv.find(arg => arg.startsWith('--severity='))
const minSeverity = minSeverityArg ? minSeverityArg.split('=')[1] : null

const child = spawn('yarn', ['npm', 'audit', '--all', '--recursive', '--json'], {
  stdio: ['ignore', 'pipe', 'inherit'],
})

let buffer = ''
child.stdout.on('data', chunk => {
  buffer += chunk.toString()
})

child.on('close', code => {
  const parsed = buffer
    .split('\n')
    .filter(Boolean)
    .map(line => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  // `yarn npm audit` exits non-zero both when it finds vulnerabilities and when
  // it fails outright (network error, unreachable registry, auth issue...). The
  // two are only distinguishable by whether it produced any parseable report at
  // all: a real failure yields no NDJSON output, so `parsed` stays empty.
  if (code !== 0 && parsed.length === 0) {
    console.error(`yarn npm audit did not complete successfully (exit code ${code}).`)
    process.exitCode = 1
    return
  }

  const advisories = parsed
    .map(entry => entry.children && { ...entry.children, package: entry.value })
    .filter(c => c && c.Severity)
    .filter(c => includeDeprecations || c.URL)
    .filter(c => !minSeverity || SEVERITY_ORDER[c.Severity] <= SEVERITY_ORDER[minSeverity])
    .sort((a, b) => SEVERITY_ORDER[a.Severity] - SEVERITY_ORDER[b.Severity])

  if (advisories.length === 0) {
    console.log('No vulnerabilities found.')
    return
  }

  const counts = advisories.reduce((acc, a) => {
    acc[a.Severity] = (acc[a.Severity] || 0) + 1
    return acc
  }, {})

  console.log('Vulnerabilities found:\n')
  for (const advisory of advisories) {
    const color = SEVERITY_COLOR[advisory.Severity] || ''
    const severity = `${color}${advisory.Severity.toUpperCase().padEnd(8)}${RESET}`
    console.log(`${severity} ${advisory.Issue}`)
    console.log(`         package: ${advisory.package}  (vulnerable: ${advisory['Vulnerable Versions']})`)
    if (advisory.URL) console.log(`         ${advisory.URL}`)
    console.log('')
  }

  const summary = Object.entries(counts)
    .sort(([a], [b]) => SEVERITY_ORDER[a] - SEVERITY_ORDER[b])
    .map(([severity, count]) => `${SEVERITY_COLOR[severity]}${count} ${severity}${RESET}`)
    .join(', ')
  console.log(`Summary: ${summary}`)
})
