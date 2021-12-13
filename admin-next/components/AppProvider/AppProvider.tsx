import * as React from 'react';
import { ViewerSession } from '../../types';
import { AppContext } from './App.context';

type AppProviderProps = {
    children: React.ReactNode,
    viewerSession: ViewerSession,
};

export const AppProvider: React.FC<AppProviderProps> = ({ children, viewerSession }) => {
    const context = React.useMemo(
        () => ({
            viewerSession,
        }),
        [viewerSession],
    );

    return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
