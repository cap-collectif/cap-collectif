import * as React from 'react';

export type SetSaving = (saving: boolean) => void;

type NavBarContext = {
    saving: boolean,
    setSaving: SetSaving,
};

type NavBarProviderProps = {
    children: React.ReactNode,
};

const NavBarContext = React.createContext<NavBarContext>({
    saving: false,
    setSaving: () => {},
});

export const useNavBarContext = (): NavBarContext => {
    const context = React.useContext(NavBarContext);
    if (!context) {
        throw new Error(`You can't use the NavBarContext outside a NavBarProvider component.`);
    }
    return context;
};

export const NavBarProvider: React.FC<NavBarProviderProps> = ({ children }) => {
    const [saving, setSaving] = React.useState(false);

    const context = React.useMemo(
        () => ({
            setSaving,
            saving,
        }),
        [setSaving, saving],
    );

    return <NavBarContext.Provider value={context}>{children}</NavBarContext.Provider>;
};
