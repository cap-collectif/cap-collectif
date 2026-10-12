import CookieMonster from './CookieMonster'

const cookieWindow = window as Window & {
  Cookies?: {
    get: (name: string) => string | undefined
    set: (name: string, value: string) => void
  }
}

describe('restoring participant authentication for a reply', () => {
  const cookies = new Map<string, string>()
  const originalCookies = cookieWindow.Cookies

  beforeEach(() => {
    cookies.clear()
    cookieWindow.Cookies = {
      get: name => cookies.get(name),
      set: (name, value) => cookies.set(name, value),
    }
    cookies.set(
      'CapcoAnonReply',
      btoa(
        JSON.stringify({
          questionnaireA: [{ replyId: 'replyA', token: 'tokenA' }],
          questionnaireB: [{ replyId: 'replyB', token: 'tokenB' }],
        }),
      ),
    )
  })

  afterEach(() => {
    cookieWindow.Cookies = originalCookies
  })

  it('restores the token for the selected reply', () => {
    CookieMonster.restoreParticipantCookieForReply('questionnaireB', 'replyB')

    expect(cookies.get('CapcoParticipant')).toBe(btoa('tokenB'))
  })

  it.each(['existingToken', 'invalid', ''])('preserves a present participant cookie: %s', token => {
    cookies.set('CapcoParticipant', token)

    CookieMonster.restoreParticipantCookieForReply('questionnaireB', 'replyB')

    expect(cookies.get('CapcoParticipant')).toBe(token)
  })

  it('does not authenticate from another reply', () => {
    CookieMonster.restoreParticipantCookieForReply('questionnaireA', 'replyB')

    expect(cookies.has('CapcoParticipant')).toBe(false)
  })

  it('leaves requests without credentials unauthenticated', () => {
    cookies.delete('CapcoAnonReply')

    CookieMonster.restoreParticipantCookieForReply('questionnaireB', 'replyB')

    expect(cookies.has('CapcoParticipant')).toBe(false)
  })

  it('rejects malformed reply credentials without authenticating', () => {
    cookies.set('CapcoAnonReply', btoa('invalid JSON'))

    expect(() => CookieMonster.restoreParticipantCookieForReply('questionnaireB', 'replyB')).toThrow()
    expect(cookies.has('CapcoParticipant')).toBe(false)
  })
})
