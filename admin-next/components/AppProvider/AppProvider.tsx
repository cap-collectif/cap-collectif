import * as React from 'react';
import { ViewerSession } from '../../types';
import { AppContext } from './App.context';

type AppProviderProps = {
    children: React.ReactNode,
    viewerSession: ViewerSession,
    appVersion: string,
};

export const AppProvider: React.FC<AppProviderProps> = ({
    children,
    viewerSession,
    appVersion,
}) => {
    const context = React.useMemo(
        () => ({
            viewerSession,
            appVersion,
        }),
        [viewerSession, appVersion],
    );

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
