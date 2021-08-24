import getSessionCookieFromReq from './request-helper';

it('can not decode the session if no cookie', () => {
    const req = { headers: { cookie: null } };
    expect(getSessionCookieFromReq(req)).toBe(null);
});

it('can not decode the session if no PHPSESSID cookie', () => {
    const req = {
        headers: {
            cookie:
                'hasFullConsent=true; analyticConsentValue=true; adCookieConsentValue=true; locale=fr-FR;',
        },
    };
    expect(getSessionCookieFromReq(req)).toBe(null);
});

it('can decode the session with a PHPSESSID cookie', () => {
    const req = { headers: { cookie: 'PHPSESSID=1234' } };
    expect(getSessionCookieFromReq(req)).toBe('1234');
});

it('can decode the session with multiple cookies', () => {
    const req = {
        headers: {
            cookie:
                'hasFullConsent=true; analyticConsentValue=true; adCookieConsentValue=true; locale=fr-FR; PHPSESSID=1234',
        },
    };
    expect(getSessionCookieFromReq(req)).toBe('1234');
});
