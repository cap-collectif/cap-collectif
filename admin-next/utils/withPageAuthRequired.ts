import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { ServerResponse } from 'http'
import getSessionCookieFromReq from './request-helper'
import getSessionFromSessionCookie from './session-resolver'
import getViewerJsonFromRedisSession from './session-decoder'
import getFeatureFlags from './feature-flags-resolver'
import frMessages from '@translations/fr-FR.json'
import enMessages from '@translations/en-GB.json'
import esMessages from '@translations/es-ES.json'
import nlMessages from '@translations/nl-NL.json'
import deMessages from '@translations/de-DE.json'
import svMessages from '@translations/sv-SE.json'
import ocMessages from '@translations/oc-OC.json'
import euMessages from '@translations/eu-EU.json'
import urMessages from '@translations/ur-IN.json'
import sideBarItems from '@components/BackOffice/SideBar/SideBarItems.json'
import { __isTest__ } from '../config'
import { getLocaleFromReq } from '../utils/locale-helper'
import { IntlType, Locale, PageProps } from '../types'

export const messages = {
  'fr-FR': frMessages,
  'en-GB': enMessages,
  'es-ES': esMessages,
  'de-DE': deMessages,
  'nl-NL': nlMessages,
  'sv-SE': svMessages,
  'oc-OC': ocMessages,
  'eu-EU': euMessages,
  'ur-IN': urMessages,
}

// Best-effort variant of the session resolution performed by `withPageAuthRequired`: returns the
// full page props if the viewer has a valid session, or `null` otherwise — it never redirects.
// Used by pages that want to render their normal `Layout` (with the sidebar/navbar) even when
// they can't render their usual content, e.g. `pages/admin-next/403.tsx`.
export const resolveViewerPageProps = async (req: GetServerSidePropsContext['req']): Promise<PageProps | null> => {
  const sessionCookie = getSessionCookieFromReq(req)
  if (!sessionCookie) {
    return null
  }

  const redisSession = await getSessionFromSessionCookie(sessionCookie)
  if (!redisSession) {
    return null
  }

  const viewerSession = getViewerJsonFromRedisSession(redisSession)
  if (!viewerSession) {
    return null
  }

  const locale = getLocaleFromReq(req)
  const intl: IntlType = {
    locale: locale || Locale.frFR,
    // For tests we disable translations
    // @ts-ignore fixme
    messages: __isTest__ ? {} : messages[locale] || messages[Locale.frFR],
  }

  const featureFlags = await getFeatureFlags()
  const appVersion = process.env.SYMFONY_APP_VERSION || 'dev'

  return { intl, viewerSession, featureFlags, appVersion }
}

// `SideBarItems.json` is the source of truth for which role a given admin-next page requires — it's
// what already drives menu visibility (see `SideBar.utils.ts`). We reuse it here so the same
// restriction is enforced server-side, without any admin-next page having to declare its own role
// requirement: adding/editing the page's `rolesRequired` entry in `SideBarItems.json` is enough.
//
// A page's effective roles are the union of its own `rolesRequired` and its enclosing group's: a
// group like "Réglages" is admin-only in the menu even though some of its pages don't carry that
// restriction themselves, and the menu only ever shows such a page to viewers who satisfy both.
const findRolesRequiredForPath = (pathname: string): string[] => {
  for (const group of sideBarItems) {
    if (group.href === pathname) {
      return group.rolesRequired ?? []
    }
    for (const item of group.items ?? []) {
      if (item.href === pathname) {
        return [...(group.rolesRequired ?? []), ...(item.rolesRequired ?? [])]
      }
    }
  }

  return []
}

// Covers every case where the viewer has no usable access to the back office at all — no cookie, no
// matching Redis session, a session with no `viewer` in it (this is also just what an anonymous
// session looks like, see `SessionWithJsonHandler::write()` on the PHP side — it's not necessarily a
// broken session), or a viewer authenticated but with none of the BO-access roles. None of these are
// reliably distinguishable from one another here, so they all get the same treatment: send the
// visitor back to the public homepage rather than a back-office-flavored error page. We still log the
// detail server-side for diagnosability.
const redirectToHome = (res: ServerResponse, logMessage: string) => {
  console.error(logMessage)

  res.writeHead(302, { Location: '/' })
  res.end()

  return { props: {} }
}

// Unlike `redirectToHome`, this targets `/admin-next/403` (back-office layout): the viewer does have
// BO access, just not to this specific page — a different situation from having none at all.
const redirectToForbidden = (res: ServerResponse) => {
  res.writeHead(302, { Location: '/admin-next/403' })
  res.end()

  return { props: {} }
}

const withPageAuthRequired: GetServerSideProps = async ({ req, res }) => {
  // If we are on error page we skip this step.
  if (req.url === '/500' || req.url === '/400') {
    return { props: {} }
  }

  // We fetch the value of session cookie
  let sessionCookie = getSessionCookieFromReq(req)
  let serverHostname = req.headers.host

  if (!sessionCookie) {
    return redirectToHome(res, `No "PHPSESSID" cookie, viewer is not logged in on "https://${serverHostname}".`)
  }

  // We have a cookie, so let's try to get the session in our redis.
  const redisSession = await getSessionFromSessionCookie(sessionCookie)
  if (!redisSession) {
    return redirectToHome(
      res,
      `This session key (${sessionCookie}) corresponding to your "PHPSESSID" could not be found in redis, please login again on "https://${serverHostname}" to generate a new one.`,
    )
  }

  // Yay we have a session, let's try to decode it to get the json data. Note: a session with no
  // `viewer` in it isn't necessarily broken — it's also what a plain anonymous session looks like.
  const viewerSession = getViewerJsonFromRedisSession(redisSession)
  if (!viewerSession) {
    return redirectToHome(
      res,
      `Failed to parse the JSON part of the session corresponding to your "PHPSESSID", please try to refresh the page or login again on "https://${serverHostname}" to generate a new one.`,
    )
  }

  if (
    !viewerSession.isAdmin &&
    !viewerSession.isProjectAdmin &&
    !viewerSession.isOrganizationMember &&
    !viewerSession.isMediator
  ) {
    return redirectToHome(res, 'Access denied: this viewer is not an admin or a project admin.')
  }

  // Some pages require a stricter role than the generic check above (e.g. strictly ROLE_ADMIN or
  // ROLE_SUPER_ADMIN) — see `findRolesRequiredForPath` above.
  const pathname = req.url?.split('?')[0]
  const requiredSideBarRoles = pathname ? findRolesRequiredForPath(pathname) : []

  if (requiredSideBarRoles.includes('superAdmin') && !viewerSession.isSuperAdmin) {
    return redirectToForbidden(res)
  }

  if (requiredSideBarRoles.includes('admin') && !viewerSession.isAdmin) {
    return redirectToForbidden(res)
  }

  // Success ! We inject a `viewerSession` props on every page.
  const locale = getLocaleFromReq(req)
  const intl: IntlType = {
    locale: locale || Locale.frFR,
    // For tests we disable translations
    // @ts-ignore fixme
    messages: __isTest__ ? {} : messages[locale] || messages[Locale.frFR],
  }

  const featureFlags = await getFeatureFlags()
  const appVersion = process.env.SYMFONY_APP_VERSION || 'dev'

  const pageProps: PageProps = {
    intl,
    viewerSession,
    featureFlags,
    appVersion,
  }

  return { props: pageProps }
}

export default withPageAuthRequired
