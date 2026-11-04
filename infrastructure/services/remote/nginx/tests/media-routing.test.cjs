// Exercise production Nginx routing with isolated Nginx/PHP-FPM processes and a synthetic PHP handler.
const assert = require('node:assert/strict')
const { spawn, execFileSync } = require('node:child_process')
const fs = require('node:fs')
const http = require('node:http')
const os = require('node:os')
const path = require('node:path')
const { setTimeout: delay } = require('node:timers/promises')
const { after, before, describe, it } = require('node:test')

const configDirectory = path.resolve(__dirname, '..')
const configFile = process.env.NGINX_TEST_CONFIG || path.join(configDirectory, 'nginx.conf')
const content = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0x0a])
const mediaPaths = ['ttf', 'otf', 'woff', 'woff2', 'eot', 'svg', 'png', 'gif', 'ico', 'css', 'js', 'TTF'].map(
  extension => `/media/default/0001/01/font.${extension}`,
)
mediaPaths.push('/media/cache/thumbnail/default/0001/01/image.svg')
const assets = ['/css/app.css', '/js/app.js', '/fonts/builtin.ttf', '/fonts/builtin.woff']
const children = []
let directory

function replaceOnce(source, from, to) {
  assert.equal(source.split(from).length, 2, `Expected one configuration entry: ${from}`)
  return source.replace(from, to)
}

function start(command, args, name) {
  const log = path.join(directory, `${name}.log`)
  const fd = fs.openSync(log, 'w')
  const child = spawn(command, args, { stdio: ['ignore', fd, fd] })
  fs.closeSync(fd)
  const process = { child, log, error: null }
  child.on('error', error => {
    process.error = error
  })
  children.push(process)
}

async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null || !child.pid) return
  await new Promise(resolve => {
    const timeout = setTimeout(() => child.kill('SIGKILL'), 3000)
    child.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })
    child.kill('SIGTERM')
  })
}

function request(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ socketPath: path.join(directory, 'http.sock'), path: url, method }, response => {
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('error', reject)
      response.on('end', () => {
        resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) })
      })
    })
    req.setTimeout(1000, () => req.destroy(new Error(`Request timed out: ${url}`)))
    req.on('error', reject)
    req.end()
  })
}

function assertApplication(response, status) {
  assert.equal(response.status, status)
  assert.equal(response.headers['x-nginx-test-handler'], 'php')
  assert.equal(response.headers['cache-control'], 'private, no-store')
}

describe('Production Nginx media routing', () => {
  before(
    async () => {
      assert.ok(fs.existsSync('/.dockerenv'), 'Run this test in the application container; see ../README.md.')
      assert.equal(process.getuid(), 0, 'Run as root so Nginx and PHP-FPM can start their capco workers.')
      directory = fs.mkdtempSync(path.join(os.tmpdir(), 'nginx-media-test-'))
      fs.chmodSync(directory, 0o755)
      const publicDirectory = path.join(directory, 'public')
      for (const url of [...mediaPaths, ...assets, '/media/default/0001/01/denied.ttf', '/other.php']) {
        const filename = path.join(publicDirectory, url)
        fs.mkdirSync(path.dirname(filename), { recursive: true })
        fs.writeFileSync(filename, content)
      }
      fs.copyFileSync(path.join(__dirname, 'front-controller.php'), path.join(publicDirectory, 'index.php'))
      fs.copyFileSync('/etc/nginx/fastcgi_params', path.join(directory, 'fastcgi_params'))
      // The fixture needs no application credentials or deployment-specific FastCGI parameters.
      fs.writeFileSync(path.join(directory, 'environments'), '')
      fs.copyFileSync(path.join(configDirectory, 'default_headers.conf'), path.join(directory, 'default_headers.conf'))

      const forward = replaceOnce(
        fs.readFileSync(path.join(configDirectory, 'fastcgi_forward.conf'), 'utf8'),
        'fastcgi_pass 127.0.0.1:9000;',
        `fastcgi_pass unix:${directory}/php.sock;`,
      )
      fs.writeFileSync(path.join(directory, 'fastcgi_forward.conf'), forward)

      // Adapt only deployment paths and process resources; keep every location and rewrite unchanged.
      let config = fs.readFileSync(configFile, 'utf8')
      for (const [from, to] of [
        ['pid /var/run/nginx.pid;', `pid ${directory}/nginx.pid;`],
        ['worker_processes 8;', 'worker_processes 1;'],
        ['listen 8080;', `listen unix:${directory}/http.sock;`],
        ['root /var/www/public;', `root ${publicDirectory};`],
        ['/var/cache/nginx', `${directory}/cache`],
      ]) {
        config = replaceOnce(config, from, to)
      }
      // GeoIP is not installed in the local/CI image and does not participate in location selection.
      config = replaceOnce(config, 'include /etc/nginx/modules-enabled/50-mod-http-geoip.conf;', '')
      config = config.replaceAll('/etc/nginx/default_headers.conf', `${directory}/default_headers.conf`)
      config = config.replaceAll('/etc/nginx/fastcgi_forward.conf', `${directory}/fastcgi_forward.conf`)
      fs.writeFileSync(path.join(directory, 'nginx.conf'), config)

      fs.writeFileSync(
        path.join(directory, 'fpm.conf'),
        `[global]
pid = ${directory}/fpm.pid
error_log = ${directory}/fpm.log
daemonize = no
[test]
user = capco
group = capco
listen = ${directory}/php.sock
listen.owner = capco
listen.group = capco
pm = static
pm.max_children = 1
catch_workers_output = yes
`,
      )
      const fpm = fs.readdirSync('/usr/sbin').find(name => /^php-fpm(?:\d+\.\d+)?$/.test(name))
      assert.ok(fpm, 'PHP-FPM must be installed in the application image.')
      const nginxArgs = ['-p', directory, '-c', path.join(directory, 'nginx.conf')]
      execFileSync('nginx', [...nginxArgs, '-t'], { stdio: 'pipe' })
      start(path.join('/usr/sbin', fpm), ['--nodaemonize', '--fpm-config', path.join(directory, 'fpm.conf')], 'php-fpm')
      start('nginx', nginxArgs, 'nginx')

      const deadline = Date.now() + 10000
      while (Date.now() < deadline) {
        for (const { child, log, error } of children) {
          if (error) throw error
          assert.equal(child.exitCode, null, fs.readFileSync(log, 'utf8'))
        }
        try {
          const response = await request('/readiness')
          if (response.status === 200 && response.headers['x-nginx-test-handler'] === 'php') return
        } catch (error) {
          if (!['ENOENT', 'ECONNREFUSED', 'ECONNRESET'].includes(error.code)) throw error
        }
        await delay(50)
      }
      throw new Error(children.map(({ log }) => fs.readFileSync(log, 'utf8')).join('\n'))
    },
    { timeout: 15000 },
  )

  after(async () => {
    for (const { child } of children.reverse()) await stop(child)
    if (directory) fs.rmSync(directory, { recursive: true, force: true })
  })

  for (const url of mediaPaths) {
    for (const method of ['GET', 'HEAD']) {
      it(`${method} ${url} reaches PHP with the original file contents`, async () => {
        const response = await request(url, method)
        assertApplication(response, 200)
        assert.deepEqual(response.body, method === 'HEAD' ? Buffer.alloc(0) : content)
      })
    }
  }

  it('preserves a PHP denial even when the media file exists on disk', async () => {
    const response = await request('/media/default/0001/01/denied.ttf')
    assertApplication(response, 403)
    assert.equal(response.body.toString(), 'denied')
  })

  it('lets PHP handle a missing media file', async () => {
    const response = await request('/media/default/0001/01/missing.ttf')
    assertApplication(response, 404)
    assert.equal(response.body.toString(), 'missing')
  })

  for (const url of assets) {
    it(`serves ${url} directly with the existing static cache policy`, async () => {
      const response = await request(url)
      assert.equal(response.status, 200)
      assert.deepEqual(response.body, content)
      assert.equal(response.headers['x-nginx-test-handler'], undefined)
      assert.equal(response.headers['cache-control'], 'max-age=315360000')
      assert.ok(response.headers.expires)
    })
  }

  it('keeps ordinary application routes working', async () => {
    const response = await request('/page')
    assert.equal(response.status, 200)
    assert.equal(response.headers['x-nginx-test-handler'], 'php')
    assert.equal(response.body.toString(), 'application')
  })

  it('does not serve or execute other PHP files', async () => {
    const response = await request('/other.php')
    assert.equal(response.status, 404)
    assert.equal(response.headers['x-nginx-test-handler'], undefined)
    assert.notDeepEqual(response.body, content)
  })
})
