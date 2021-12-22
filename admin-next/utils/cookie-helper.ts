import { parseCookies, setCookie } from 'nookies';
import * as cookie from 'cookie';

const Cookie = {
    getCookie: (key: string): string => {
        const listOfCookies = parseCookies();
        return listOfCookies[key];
    },
    setCookie: (key: string, value: string, options?: cookie.CookieSerializeOptions): void => {
        setCookie(null, key, value, {
            domain: process.env.PRODUCTION ? window.location.host : '.capco.dev',
            expires: Cookie.getDateDifference(undefined, undefined, 1),
            secure: true,
            sameSite: 'strict',
            ...options,
        });
    },
    getDateDifference: (day?: number, month?: number, year?: number): Date => {
        const dateUpdated = new Date();

        if (day) dateUpdated.setDate(dateUpdated.getDate() + day);
        if (month) dateUpdated.setMonth(dateUpdated.getMonth() + month);
        if (year) dateUpdated.setFullYear(dateUpdated.getFullYear() + year);

        return dateUpdated;
    },
};

export default Cookie;
