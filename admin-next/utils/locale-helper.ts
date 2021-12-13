import cookie from 'cookie';
import { setCookie } from 'nookies';
import CookieHelper from './cookie-helper';
import { NextApiRequest } from 'next';

const LOCALE_COOKIE_NAME = 'locale';

export function getLocaleFromReq(req: NextApiRequest): string | undefined | null {
    const cookieHeader = req && req.headers && req.headers.cookie;
    if (cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        return cookies[LOCALE_COOKIE_NAME];
    }

    return null;
}

export function setLocaleCookie(locale: string): void {
    setCookie(null, LOCALE_COOKIE_NAME, locale, {
        domain: process.env.PRODUCTION ? window.location.host : '.capco.dev',
        expires: CookieHelper.getDateDifference(undefined, undefined, 1),
        secure: true,
        sameSite: 'strict',
    });
}

// from fr-FR to FR_FR
export function formatLocaleToCode(locale: string): string {
    return locale.replace('-', '_').toUpperCase();
}

// from FR_FR to fr-FR
export function formatCodeToLocale(code: string): string {
    const codeSplitted = code.split('_');
    codeSplitted[0] = codeSplitted[0].toLowerCase();
    return codeSplitted.join('-');
}
