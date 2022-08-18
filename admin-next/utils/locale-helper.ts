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

export function getOnlyLanguage(locale: string) {
    switch (locale) {
        case 'en-GB':
        case 'eu-EU':
            return 'en-gb';
        case 'de-DE':
            return 'de';
        case 'es-ES':
            return 'es';
        case 'nl-NL':
            return 'nl';
        case 'sv-SE':
            return 'sv';
        case 'fr-FR':
        case 'oc-OC':
        default:
            return 'fr';
    }
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
    translations: ReadonlyArray<Translation> | null,
): Translation[] {
    const translateAlreadyExist = translations?.some(translation => translation.locale === locale);
    const fieldsAdded = fields.reduce(
        (acc, field) => ({
            ...acc,
            [field.name]: field.value,
        }),
        {},
    );

    if (translateAlreadyExist) {
        return translations.map(translation => {
            if (translation.locale === locale) {
                return {
                    locale,
                    ...fieldsAdded,
                };
            }

            return translation;
        });
    }
    if (translations) return [...translations, { locale, ...fieldsAdded }];
    return [{ locale, ...fieldsAdded }];
}
