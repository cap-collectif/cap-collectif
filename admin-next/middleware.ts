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

function buildLegacyPathCandidates(pathname: string, localePrefixes: string[]): Set<string> {
  const paths = new Set<string>(['/', '/admin-next'])
  const parts = pathname.split('/').filter(Boolean)

  for (let i = 1; i <= parts.length; i += 1) {
    paths.add(`/${parts.slice(0, i).join('/')}`)
  }

  localePrefixes.forEach(prefix => {
    paths.add(`/${prefix}/admin-next`)
  })

  return paths
}

function buildLegacyDomainCandidates(hostname: string): Set<string> {
  const domains = new Set<string>()
  if (hostname) {
    domains.add(hostname)
    domains.add(`.${hostname}`)
  }
  domains.add('.capco.dev')

  return domains
}

function clearLegacyLocaleCookies(response: NextResponse, hostname: string, pathname: string): void {
  const paths = buildLegacyPathCandidates(pathname, Object.keys(prefixToLocale))
  const domains = buildLegacyDomainCandidates(hostname)

  paths.forEach(path => {
    response.cookies.set('locale', '', {
      path,
      expires: new Date(0),
      sameSite: 'strict',
    })

    domains.forEach(domain => {
      response.cookies.set('locale', '', {
        path,
        domain,
        expires: new Date(0),
        sameSite: 'strict',
      })
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
  if (current !== locale) {
    clearLegacyLocaleCookies(response, req.nextUrl.hostname, pathname)
    response.cookies.set('locale', locale, {
      path: '/',
      sameSite: 'strict',
      secure: req.nextUrl.protocol === 'https:',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 395),
    })
  }

  return response
}

export const config = {
  matcher: [
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/admin-next/:path*',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/profile/organization/:path*',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/project-district/:path*',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/pages/:path*',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/contact',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/projects',
    '/:locale(en|fr|es|de|nl|sv|eu|oc|ur)/blog',
  ],
}
