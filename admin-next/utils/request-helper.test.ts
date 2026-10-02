// @ts-nocheck
import getSessionCookieFromReq from './request-helper'

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
it('can not decode the session if no cookie', () => {
  const req = { headers: { cookie: null } }
  expect(getSessionCookieFromReq(req)).toBe(null)
})

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
it('can not decode the session if no PHPSESSID cookie', () => {
  const req = {
    headers: {
      cookie: 'hasFullConsent=true; analyticConsentValue=true; adCookieConsentValue=true; locale=fr-FR;',
    },
  }
  expect(getSessionCookieFromReq(req)).toBe(null)
})

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
it('can decode the session with a PHPSESSID cookie', () => {
  const req = { headers: { cookie: 'PHPSESSID=1234' } }
  expect(getSessionCookieFromReq(req)).toBe('1234')
})

/**
 * @jest-status compliant
 * @jest-reason Checks a public function result or error using explicit local inputs and expected values.
 */
it('can decode the session with multiple cookies', () => {
  const req = {
    headers: {
      cookie: 'hasFullConsent=true; analyticConsentValue=true; adCookieConsentValue=true; locale=fr-FR; PHPSESSID=1234',
    },
  }
  expect(getSessionCookieFromReq(req)).toBe('1234')
})
