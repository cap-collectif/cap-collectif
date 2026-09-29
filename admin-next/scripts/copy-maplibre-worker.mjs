import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const dist = path.join(path.dirname(require.resolve('maplibre-gl/package.json')), 'dist')
const destination = path.join(process.cwd(), 'public', 'maplibre')

mkdirSync(destination, { recursive: true })
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(path.join(dist, file), path.join(destination, file))
}
