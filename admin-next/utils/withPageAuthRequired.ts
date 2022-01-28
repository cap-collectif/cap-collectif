import { GetServerSideProps } from 'next';
import getSessionCookieFromReq from './request-helper';
import getSessionFromSessionCookie from './session-resolver';
import getViewerJsonFromRedisSession from './session-decoder';
import getFeatureFlags from './feature-flags-resolver';
import frMessages from '~/../../translations/fr-FR.json';
import enMessages from '~/../../translations/en-GB.json';
import esMessages from '~/../../translations/es-ES.json';
import nlMessages from '~/../../translations/nl-NL.json';
import deMessages from '~/../../translations/de-DE.json';
import svMessages from '~/../../translations/sv-SE.json';
import ocMessages from '~/../../translations/oc-OC.json';
import euMessages from '~/../../translations/eu-EU.json';
import { __isDev__, __isTest__ } from '../config';
import { getLocaleFromReq } from '../utils/locale-helper';

const messages = {
    'fr-FR': frMessages,
    'en-GB': enMessages,
    'es-ES': esMessages,
    'de-DE': deMessages,
    'nl-NL': nlMessages,
    'sv-SE': svMessages,
    'oc-OC': ocMessages,
    'eu-EU': euMessages,
};

const redirectOnError = (res: NextApiResponse, devErrorMessage: string) => {
    if (__isDev__) {
        throw new Error(devErrorMessage);
    }
    // In production we redirect to the frontend homepage.
    res.writeHead(302, { Location: '/' });
    res.end();

    // We redirect to the frontend homepage but
    // `GetServerSideProps` must return an object, so let's return an empty object.
    return { props: {} };
};

const withPageAuthRequired: GetServerSideProps = async ({ req, res }) => {
    const pageProps = { intl: {} };

    // If we are on error page we skip this step.
    if (req.url === '/500' || req.url === '/400') {
        return { props: pageProps };
    }

    // We fetch the value of session cookie
    let sessionCookie = getSessionCookieFromReq(req);
    if (!sessionCookie) {
        return redirectOnError(
            res,
            'Please come back with a "PHPSESSID" cookie, login on "https://capco.dev" to generate one.',
        );
    }

    // We have a cookie, so let's try to get the session in our redis.
    const redisSession = await getSessionFromSessionCookie(sessionCookie);
    if (!redisSession) {
        return redirectOnError(
            res,
            `This session key (${sessionCookie}) corresponding to your "PHPSESSID" could not be found in redis, please login again on "https://capco.dev" to generate a new one.`,
        );
    }

    // Yay we have a session, let's try to decode it to get the json data.
    const viewerJson = getViewerJsonFromRedisSession(redisSession);
    if (!viewerJson) {
        return redirectOnError(
            res,
            'Failed to parse the JSON part of the session corresponding to your `PHPSESSID`, please try to refresh the page or login again on "https://capco.dev" to generate a new one.',
        );
    }

    if (!viewerJson.isAdmin && !viewerJson.isProjectAdmin) {
        return redirectOnError(
            res,
            'Access denied: this viewer is not an admin or a project admin.',
        );
    }

    // Success ! We inject a `viewerSession` props on every page.
    pageProps.viewerSession = viewerJson;

    const locale = getLocaleFromReq(req);
    pageProps.intl = {
        locale: locale || 'fr-FR',
        // For tests we disable translations
        messages: __isTest__ ? {} : messages[locale] || messages['fr-FR'],
    };

    pageProps.featureFlags = await getFeatureFlags();
    pageProps.appVersion = process.env.SYMFONY_APP_VERSION || 'dev';

    return { props: pageProps };
};

export default withPageAuthRequired;
