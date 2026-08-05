#!/usr/bin/env node
// Yarn Berry has no built-in equivalent of `npm audit fix`, but it has the
// right primitive: `yarn up -R <pkg>` re-resolves every lockfile entry for
// that package to the highest version allowed by the ranges already declared
// in the tree, without touching any package.json (same non-breaking guarantee
// as `npm audit fix`). This script simply feeds it the packages flagged by
// `yarn npm audit --all --recursive`, then re-runs the audit to list what
// still needs a manual (potentially breaking) version bump.

/* eslint-disable no-console */
import { spawnSync } from 'node:child_process'

function audit() {
  const result = spawnSync('yarn', ['npm', 'audit', '--all', '--recursive', '--json'], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 100,
  })
  if (result.error) throw result.error

  const parsed = (result.stdout || '')
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
  if (result.status !== 0 && parsed.length === 0) {
    const detail = (result.stderr || '').trim() || (result.stdout || '').trim() || `exit code ${result.status}`
    throw new Error(`yarn npm audit did not complete successfully:\n${detail}`)
  }

  return parsed
    .map(entry => entry.children && { ...entry.children, package: entry.value })
    // Entries without a URL are deprecation notices, not vulnerabilities.
    .filter(c => c && c.Severity && c.URL)
}

console.log('Auditing...')
const before = audit()
if (before.length === 0) {
  console.log('No vulnerabilities found.')
  process.exit(0)
}

const packages = [...new Set(before.map(a => a.package))].sort()
console.log(`\n${before.length} advisories affecting ${packages.length} package(s):`)
packages.forEach(p => console.log(`  ${p}`))

console.log('\nRe-resolving them within the declared ranges (yarn up -R)...\n')
const up = spawnSync('yarn', ['up', '-R', ...packages], { stdio: 'inherit' })
if (up.status !== 0) process.exit(up.status ?? 1)

console.log('\nAuditing again...')
const after = audit()
const remaining = new Set(after.map(a => a.package))
const fixed = packages.filter(p => !remaining.has(p))

console.log('\n--- Summary ---')
if (fixed.length > 0) {
  console.log(`\nFixed (${fixed.length}):`)
  fixed.forEach(p => console.log(`  ${p}`))
}
if (remaining.size > 0) {
  console.log(`\nStill vulnerable (${remaining.size}) — no fixed version exists within the declared ranges.`)
  console.log('These need a manual version bump in the package.json of their dependents:')
  for (const packageName of [...remaining].sort()) {
    const dependents = new Set(after.filter(a => a.package === packageName).flatMap(a => a.Dependents || []))
    console.log(
      `  ${packageName}  (required by: ${[...dependents].slice(0, 4).join(', ')}${dependents.size > 4 ? ', ...' : ''})`,
    )
  }
  console.log('\nDetails: yarn audit:report')
} else {
  console.log('\nAll reported vulnerabilities are fixed.')
}
console.log('\nOnly yarn.lock was modified: review the diff, run the tests, commit.')
