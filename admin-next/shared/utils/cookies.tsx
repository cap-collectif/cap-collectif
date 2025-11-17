export const FULL_CONSENT_COOKIE = 'hasFullConsent'
export const ANALYTICS_COOKIE = 'analyticConsentValue'
export const ADS_COOKIE = 'adCookieConsentValue'
export const LOCALE_COOKIE = 'locale'
export const ANONYMOUS_AUTHENTICATED_WITH_CONFIRMED_PHONE = 'AnonymousAuthenticatedWithConfirmedPhone'

export const formatCookiesForServer = cookieStore =>
  cookieStore
    .getAll()
    .map(({ name, value }) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('; ')
