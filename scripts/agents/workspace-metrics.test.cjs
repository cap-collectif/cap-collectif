// Verify on-demand workspace measurements in an isolated checkout inside the application container.
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const { spawnSync } = require('node:child_process')

function fixture(t) {
  const root = fs.mkdtempSync(join(tmpdir(), 'workspace-metrics-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  fs.mkdirSync(join(root, '.circleci'))
  fs.mkdirSync(join(root, 'scripts/agents'), { recursive: true })
  fs.symlinkSync(join(__dirname, '../../vendor'), join(root, 'vendor'))
  fs.copyFileSync(join(__dirname, 'workspace-metrics.php'), join(root, 'scripts/agents/workspace-metrics.php'))
  const run = () =>
    spawnSync('php', [join(root, 'scripts/agents/workspace-metrics.php'), join(root, 'reports/prepare.json')], {
      encoding: 'utf8',
    })
  const report = () => JSON.parse(fs.readFileSync(join(root, 'reports/prepare.json')))
  const configure = paths =>
    fs.writeFileSync(
      join(root, '.circleci/config.yml'),
      JSON.stringify({ jobs: { prepare: { steps: [{ persist_to_workspace: { root, paths } }] } } }),
    )
  return { root, run, report, configure }
}

test('parses the real CircleCI configuration with its shared job and step aliases', t => {
  const { root, run, report } = fixture(t)
  fs.copyFileSync(join(__dirname, '../../.circleci/config.yml'), join(root, '.circleci/config.yml'))
  const result = run()
  assert.equal(result.status, 0, result.stderr)
  assert.ok(report().paths.some(entry => entry.path === 'frontend/js/__generated__'))
})

test('counts hard links once, leaves symlinks unresolved and reports missing paths', t => {
  const { root, run, report, configure } = fixture(t)
  fs.mkdirSync(join(root, 'data'))
  fs.mkdirSync(join(root, 'var/cache/dev'), { recursive: true })
  fs.writeFileSync(join(root, 'data/original'), Buffer.alloc(8192))
  fs.linkSync(join(root, 'data/original'), join(root, 'var/cache/dev/link'))
  fs.writeFileSync(join(root, 'external'), Buffer.alloc(1024 * 1024))
  fs.symlinkSync('../external', join(root, 'data/symlink'))
  configure(['data', 'var', 'nodes_modules'])
  const result = run()
  assert.equal(result.status, 0, result.stderr)
  const metrics = report()
  const expected = ['data', 'data/original', 'data/symlink', 'var', 'var/cache', 'var/cache/dev'].reduce(
    (total, path) => total + fs.lstatSync(join(root, path)).size,
    0,
  )
  assert.equal(metrics.total_apparent_bytes, expected)
  assert.equal(metrics.paths[2].present, false)
  assert.ok(metrics.breakdown.some(entry => entry.path === 'var/cache/dev'))
  assert.equal(
    metrics.total_apparent_bytes,
    metrics.paths.reduce((total, entry) => total + entry.apparent_bytes, 0),
  )
})

for (const path of ['../external', 'var/*', '/tmp']) {
  test(`rejects a nonliteral or external workspace path: ${path}`, t => {
    const { run, configure } = fixture(t)
    configure([path])
    assert.notEqual(run().status, 0)
  })
}
