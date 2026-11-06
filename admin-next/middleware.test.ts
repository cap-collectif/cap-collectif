/** @jest-environment node */
import { NextRequest } from 'next/server'
import { middleware } from './middleware'

it('replaces the locale and expires legacy cookies without losing their paths and domains', () => {
  const request = new NextRequest('https://localhost/en/sitemap', {
    headers: { host: 'capco.test', cookie: 'locale=ur-IN' },
  })
  const response = middleware(request)
  const cookies = response.headers.getSetCookie()

  expect(cookies).toContainEqual(expect.stringMatching(/^locale=en-GB; Path=\//))
  expect(cookies).toContainEqual(expect.stringMatching(/^locale=; Path=\/en\/sitemap; Expires=/))
  expect(cookies).toContainEqual(expect.stringMatching(/^locale=; Path=\/; Domain=capco\.test; Expires=/))
})

it('does not rewrite locale cookies when the URL and cookie already match', () => {
  const request = new NextRequest('https://capco.test/en/sitemap', {
    headers: { cookie: 'locale=en-GB' },
  })

  expect(middleware(request).headers.getSetCookie()).toEqual([])
})

it('cleans up duplicate locale cookies even when Next selects the URL locale', () => {
  const request = new NextRequest('https://localhost/en/sitemap', {
    headers: { host: 'capco.test', cookie: 'locale=ur-IN; locale=en-GB' },
  })

  expect(middleware(request).headers.getSetCookie()).toContainEqual(
    expect.stringMatching(/^locale=; Path=\/; Domain=capco\.test; Expires=/),
  )
})

it('keeps cleanup headers bounded for nested admin routes', () => {
  const projectId = 'a'.repeat(36)
  const stepId = 'b'.repeat(36)
  const request = new NextRequest(
    `https://localhost/en/admin-next/project/${projectId}/update-step/collect-step/${stepId}`,
    { headers: { host: 'foo.capco.dev', cookie: 'locale=ur-IN' } },
  )
  const response = middleware(request)
  const size = response.headers.getSetCookie().reduce((total, cookie) => total + Buffer.byteLength(cookie), 0)

  expect(size).toBeLessThan(2000)
})
