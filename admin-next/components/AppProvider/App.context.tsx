import * as React from 'react';
import { ViewerSession } from '../../types';

type AppContext = {
    viewerSession: ViewerSession,
    appVersion: string,
};

export const AppContext = React.createContext<AppContext>({
    viewerSession: {
        email: '',
        username: '',
        id: '',
        isAdmin: true,
        isSuperAdmin: false,
        isProjectAdmin: false,
        isAdminOrganization: false,
        isOrganizationMember: false,
    },
    appVersion: '',
});

export const useAppContext = (): AppContext => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error(`You can't use the AppContext outside a AppProvider component.`);
    }
    return context;
};
