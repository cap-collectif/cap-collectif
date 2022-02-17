import type { ReactNode } from 'react';
import cookie from 'cookie';
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
    CookieHelper.setCookie(LOCALE_COOKIE_NAME, locale);
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

type Translation = {
    readonly locale: string,
    readonly [field: string]: ReactNode,
};

export type TranslateField = {
    name: string
    value: ReactNode
}

export function createOrReplaceTranslation(
    fields: TranslateField[],
    locale: string,
    translations: ReadonlyArray<Translation>,
): Translation[] {
    const translateAlreadyExist = translations.some(translation => translation.locale === locale);
    const fieldsAdded = fields.reduce((acc, field) => ({
        ...acc,
        [field.name]: field.value
    }), {})

    if (translateAlreadyExist) {
        return translations.map(translation => {
            if (translation.locale === locale) {
                return {
                    locale,
                    ...fieldsAdded
                };
            }

            return translation;
        });
    }

    return [...translations, { locale, ...fieldsAdded }];
}
