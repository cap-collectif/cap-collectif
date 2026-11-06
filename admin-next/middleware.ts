import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const prefixToLocale: Record<string, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
  nl: 'nl-NL',
  sv: 'sv-SE',
  eu: 'eu-EU',
  oc: 'oc-OC',
  ur: 'ur-IN',
}

function getLocalePrefix(pathname: string): string | null {
  const match = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  if (!match) return null
  return match[1]
}

function buildLegacyPathCandidates(pathname: string): Set<string> {
  const paths = new Set<string>(['/', '/admin-next'])
  // shortcut: deeper path-scoped cookies remain; extend cleanup if such legacy cookies are found.
  const parts = pathname.split('/').filter(Boolean).slice(0, 2)

  for (let i = 1; i <= parts.length; i += 1) {
    paths.add(`/${parts.slice(0, i).join('/')}`)
  }

  return paths
}

function buildLegacyDomainCandidates(hostname: string): Set<string> {
  const domains = new Set<string>()
  if (hostname) {
    domains.add(hostname)
  }
  if (hostname === 'capco.dev' || hostname.endsWith('.capco.dev')) {
    domains.add('.capco.dev')
  }

  return domains
}

function clearLegacyLocaleCookies(response: NextResponse, hostname: string, pathname: string): void {
  const paths = buildLegacyPathCandidates(pathname)
  const domains = buildLegacyDomainCandidates(hostname)

  paths.forEach(path => {
    if (path !== '/') {
      response.headers.append(
        'set-cookie',
        `locale=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`,
      )
    }

    domains.forEach(domain => {
      response.headers.append(
        'set-cookie',
        `locale=; Path=${path}; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`,
      )
    })
  })
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const prefix = getLocalePrefix(pathname)
  if (!prefix) return NextResponse.next()

  const locale = prefixToLocale[prefix]
  if (!locale) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, '/')

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-capco-locale', locale)

  const response = NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  })

  const current = req.cookies.get('locale')?.value
  const localeCookies = (req.headers.get('cookie') || '')
    .split(';')
    .filter(cookie => cookie.trimStart().startsWith('locale='))
  if (current !== locale || localeCookies.length > 1) {
    response.cookies.set('locale', locale, {
      path: '/',
      sameSite: 'strict',
      secure: req.nextUrl.protocol === 'https:',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 395),
    })
    const hostname = req.headers.get('host')?.split(':')[0] || req.nextUrl.hostname
    clearLegacyLocaleCookies(response, hostname, pathname)
  }

  return response
}

export const config = {
  matcher: [
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/sitemap',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/admin-next/:path*',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/profile/organization/:path*',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/project-district/:path*',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/test-project/:projectSlug',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/pages/:path*',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/contact',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/projects',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/blog',
  ],
}
