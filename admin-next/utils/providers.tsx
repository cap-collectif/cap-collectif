// This is similar to `frontend/js/startup/Providers.js` but with less deps
import React from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { IntlProvider } from 'react-intl';
import { CapUIProvider } from '@cap-collectif/ui';
import { FeatureFlags, IntlType } from '../types';
import getEnvironment from './relay-environement';

type ProvidersProps = {
    featureFlags: FeatureFlags
    intl: IntlType
};

const Providers: React.FC<ProvidersProps> = ({ children,  intl, featureFlags }) => {
    return (
        <RelayEnvironmentProvider environment={getEnvironment(featureFlags)}>
            <IntlProvider locale={intl.locale} messages={intl.messages}>
                <CapUIProvider>{children}</CapUIProvider>
            </IntlProvider>
        </RelayEnvironmentProvider>
    );
};

export default Providers;
