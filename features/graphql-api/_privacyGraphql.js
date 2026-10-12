/* eslint-env jest */
const fetch = require('node-fetch')

export const admin = { Authorization: 'Bearer iamthetokenofadmin' }
export const user = { Authorization: 'Bearer iamthetokenofuser' }
export const emptyPage = { startCursor: null, endCursor: null, hasNextPage: false, hasPreviousPage: false }

export const request = async (query, variables = {}, schema = 'internal', headers = {}, allowErrors = false) => {
  const response = await fetch(`https://capco.test/graphql${schema === 'preview' ? '' : `/${schema}`}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: schema === 'preview' ? 'application/vnd.cap-collectif.preview+json' : 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  })
  expect(allowErrors ? [200, 401] : [200]).toContain(response.status)
  const body = await response.json()
  if (allowErrors) return body
  expect(body.errors).toBeUndefined()
  return body.data
}

export const login = async (username, password = 'toto') => {
  const response = await fetch('https://capco.test/login_check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  expect(response.status).toBe(200)
  expect(await response.json()).toMatchObject({ success: true })
  return {
    Cookie: response.headers
      .raw()
      ['set-cookie'].map(cookie => cookie.split(';')[0])
      .join('; '),
  }
}

export const replyCookie = (replyId, token, questionnaire = 'questionnaireAnonymous') => ({
  Cookie: `CapcoAnonReply=${Buffer.from(
    JSON.stringify({
      [toGlobalId('Questionnaire', questionnaire)]: [{ replyId, token }],
    }),
  ).toString('base64')}`,
})

export const participantCookie = token => ({ Cookie: `CapcoParticipant=${Buffer.from(token).toString('base64')}` })
