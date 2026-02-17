export const FULL_CONSENT_COOKIE = 'hasFullConsent'
export const ANALYTICS_COOKIE = 'analyticConsentValue'
export const ADS_COOKIE = 'adCookieConsentValue'
export const LOCALE_COOKIE = 'locale'
export const ANONYMOUS_AUTHENTICATED_WITH_CONFIRMED_PHONE = 'AnonymousAuthenticatedWithConfirmedPhone'

export const formatCookiesForServer = (cookieStore, overrides: Record<string, string> = {}) => {
  const mergedCookies = new Map<string, string>()

  cookieStore.getAll().forEach(({ name, value }) => {
    mergedCookies.set(name, value)
  })

  Object.entries(overrides).forEach(([name, value]) => {
    mergedCookies.set(name, value)
  })

  return Array.from(mergedCookies.entries())
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('; ')
}
