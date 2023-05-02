// This is similar to `frontend/js/startup/Providers.js` but with less deps
import React from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { IntlProvider } from 'react-intl';
import { CapUIProvider } from '@cap-collectif/ui';
import { FeatureFlags, IntlType, ViewerSession } from '../types';
import getEnvironment from './relay-environement';
import { AppProvider } from '../components/AppProvider/AppProvider';
import { LazyMotion, domAnimation } from 'framer-motion';

type ProvidersProps = {
    featureFlags: FeatureFlags
    intl: IntlType
    viewerSession: ViewerSession
    appVersion: string
};

const Providers: React.FC<ProvidersProps> = ({ children,  intl, featureFlags , viewerSession, appVersion}) => {
    return (
        <RelayEnvironmentProvider environment={getEnvironment(featureFlags)}>
            <IntlProvider locale={intl.locale} messages={intl.messages}>
                <CapUIProvider>
                    <AppProvider viewerSession={viewerSession} appVersion={appVersion}>
                        <LazyMotion features={domAnimation}>{children}</LazyMotion>
                    </AppProvider>
                </CapUIProvider>
            </IntlProvider>
        </RelayEnvironmentProvider>
    );
};

export default Providers;
