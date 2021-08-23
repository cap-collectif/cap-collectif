import { FC } from 'react';
import App, { AppProps } from 'next/app';
import moment from 'moment';
import { NextApiResponse } from 'next';
import Providers from '~/startup/Providers';
import appStore from '~/stores/AppStore';
import frMessages from '~/../../translations/fr-FR.json';
import enMessages from '~/../../translations/en-GB.json';
import esMessages from '~/../../translations/es-ES.json';
import nlMessages from '~/../../translations/nl-NL.json';
import deMessages from '~/../../translations/de-DE.json';
import svMessages from '~/../../translations/sv-SE.json';
import ocMessages from '~/../../translations/oc-OC.json';
import euMessages from '~/../../translations/eu-EU.json';
import getSessionCookieFromReq from '../utils/request-helper';
import getSessionFromSessionCookie from '../utils/session-resolver';
import getViewerJsonFromRedisSession from '../utils/session-decoder';
import { __isDev__ } from '../config';

// We use this component to only render when window is available (it's used by our Redux store)
const SafeHydrate: FC<{}> = ({ children }) => {
    return (
        <div suppressHydrationWarning>
            {typeof window === 'undefined' || typeof document === 'undefined' ? null : children}
        </div>
    );
};

// This is the entrypoint where we inject all providers and shared data
function MyApp({ Component, pageProps }: AppProps) {
    return (
        <SafeHydrate>
            <Providers unstable__AdminNextstore={appStore(pageProps.store)}>
                <Component {...pageProps} />
            </Providers>
        </SafeHydrate>
    );
}

const redirectOnError = (res: NextApiResponse, devErrorMessage: string) => {
    if (__isDev__) {
        throw new Error(devErrorMessage);
    }
    // In production we redirect to the frontend homepage.
    res.writeHead(301, { Location: '/' });
    res.end();
};

// This will be executed on server-side on every requests.
MyApp.getInitialProps = async appContext => {
    const appProps = await App.getInitialProps(appContext);
    const context = appContext.ctx;
    const { req, res, err } = context;
    const pageProps = { store: { intl: {} } };

    // If we are on error page we skip this step.
    if (req.url === '/500' || req.url === '/400') {
        return { ...appProps, pageProps };
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

    // TODO: this sould be dynamic, I will refactor this part in next PR.
    const locale = 'fr-FR';

    const messages = {
        fr: frMessages,
        en: enMessages,
        es: esMessages,
        de: deMessages,
        nl: nlMessages,
        sv: svMessages,
        oc: ocMessages,
        eu: euMessages,
    };

    const intl = {
        locale,
        // TODO: this sould be dynamic
        messages: messages['fr'],
    };
    pageProps.store = { intl, user: { user: viewerJson } };
    pageProps.appVersion = process.env.SYMFONY_APP_VERSION || 'dev';

    return { ...appProps, pageProps };
};

export default MyApp;
