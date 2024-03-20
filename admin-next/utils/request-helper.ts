import cookie from 'cookie'
import { IncomingMessage } from 'http'

const SESSION_COOKIE_NAME = 'PHPSESSID'

const getSessionCookieFromReq = (req: IncomingMessage): string | null => {
  const cookieHeader = req && req.headers && req.headers.cookie
  if (cookieHeader) {
    const cookies = cookie.parse(cookieHeader)
    return cookies[SESSION_COOKIE_NAME] || null
  }
  return null
}

export default getSessionCookieFromReq
