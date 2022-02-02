import * as React from 'react';
import ReactDOM from 'react-dom';
import Providers from '../utils/providers';
import { RelayEnvironmentProvider } from 'react-relay';
import type { FeatureFlags } from '../types';
import { intlMock, features as mockFeatures } from './mocks';
import GlobalCSS from 'styles/GlobalCSS';

export const mockRandomValues = () => {
    global.Math.random = () => 0.5;
};

export const enableFeatureFlags = (flags: [FeatureFlags]) => {
    // @ts-ignore
    global.mockFeatureFlag.mockImplementation((flag: FeatureFlagType) => {
        if (flags.includes(flag)) {
            return true;
        }
        return false;
    });
};

export const disableFeatureFlags = () => {
    // @ts-ignore
    global.mockFeatureFlag.mockImplementation(() => false);
};

export const mockUrl = (url: string) => {
    // @ts-ignore assign new URL(...) to window.location because property location is not writable
    delete window.location;
    // @ts-ignore assign new URL(...) to window.location because property location is not writable
    window.location = new URL(url);
};

export const addsSupportForPortals = () => {
    // See: https://github.com/facebook/react/issues/11565
    // @ts-ignore
    ReactDOM.createPortal = jest.fn(element => {
        return element;
    });
};

export const clearSupportForPortals = () => {
    // @ts-ignore
    ReactDOM.createPortal.mockClear();
};

type Props = {
    children: React.ReactNode,
    viewerSession?: null | undefined | any,
    features?: FeatureFlags,
};

export const MockProviders = ({ children, viewerSession, features }: Props) => {
    return (
        <Providers
            featureFlags={{ ...mockFeatures, ...features }}
            // @ts-ignore Types are a bit different since it's a mock
            intl={intlMock}
            viewerSession={viewerSession}
            appVersion="test">
            <GlobalCSS />
            {children}
        </Providers>
    );
};

type RelaySuspensFragmentTestProps = { environment: any } & Props;

export const RelaySuspensFragmentTest = ({
    children,
    environment,
    features,
}: RelaySuspensFragmentTestProps) => {
    return (
        <MockProviders features={features}>
            <RelayEnvironmentProvider environment={environment}>
                <React.Suspense fallback="">{children}</React.Suspense>
            </RelayEnvironmentProvider>
        </MockProviders>
    );
};

export default MockProviders;
