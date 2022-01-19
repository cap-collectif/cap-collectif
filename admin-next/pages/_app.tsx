import React from 'react';
import App, { AppProps } from 'next/app';
import { NextApiResponse } from 'next';
import Providers from '../utils/providers';
import GlobalCSS from '../styles/GlobalCSS';
import Fonts from '../styles/Fonts';

// We use this component to only render when window is available (it's used by our Redux store)
const SafeHydrate: React.FC<{}> = ({ children }) => {
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
            <Providers
                featureFlags={pageProps.featureFlags}
                intl={pageProps.intl}
                viewerSession={pageProps.viewerSession}
                appVersion={pageProps.appVersion}>
                <GlobalCSS />
                <Fonts />
                <Component {...pageProps} />
            </Providers>
        </SafeHydrate>
    );
}

export default MyApp;
