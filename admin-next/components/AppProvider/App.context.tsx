import * as React from 'react';
import { ViewerSession } from '../../types';

type AppContext = {
    viewerSession: ViewerSession,
};

export const AppContext = React.createContext<AppContext>({
    viewerSession: {
        email: '',
        username: '',
        id: '',
        isAdmin: true,
        isSuperAdmin: false,
        isProjectAdmin: false,
    },
});

export const useAppContext = (): AppContext => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error(`You can't use the AppContext outside a AppProvider component.`);
    }
    return context;
};
