import { GetServerSideProps } from 'next'
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
import { __isDev__, __isTest__ } from '../config'
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

export const redirectOnError = (res: ServerResponse, devErrorMessage: string) => {
  if (__isDev__) {
    throw new Error(devErrorMessage)
  }
  // In production we redirect to the frontend homepage.
  res.writeHead(302, { Location: '/' })
  res.end()

  // We redirect to the frontend homepage but
  // `GetServerSideProps` must return an object, so let's return an empty object.
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
    return redirectOnError(
      res,
      `Please come back with a "PHPSESSID" cookie, login on "https://${serverHostname}" to generate one.`,
    )
  }

  // We have a cookie, so let's try to get the session in our redis.
  const redisSession = await getSessionFromSessionCookie(sessionCookie)
  if (!redisSession) {
    return redirectOnError(
      res,
      `This session key (${sessionCookie}) corresponding to your "PHPSESSID" could not be found in redis, please login again on "https://${serverHostname}" to generate a new one.`,
    )
  }

  // Yay we have a session, let's try to decode it to get the json data.
  const viewerSession = getViewerJsonFromRedisSession(redisSession)
  if (!viewerSession) {
    return redirectOnError(
      res,
      'Failed to parse the JSON part of the session corresponding to your `PHPSESSID`, please try to refresh the page or login again on "https://${serverHostname}" to generate a new one.',
    )
  }

  if (
    !viewerSession.isAdmin &&
    !viewerSession.isProjectAdmin &&
    !viewerSession.isOrganizationMember &&
    !viewerSession.isMediator
  ) {
    return redirectOnError(res, 'Access denied: this viewer is not an admin or a project admin.')
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
