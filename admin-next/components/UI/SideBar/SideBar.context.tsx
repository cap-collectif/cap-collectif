import * as React from 'react';

type SideBarContext = {
    menuOpen: string | null,
    setMenuOpen: (menuId: string | null) => void,
    fold: boolean,
    toggleFold: () => void,
};

type SideBarProviderProps = {
    children: React.ReactNode,
    defaultMenuOpen: string | null,
    defaultFold: boolean,
    onFold?: (fold: boolean) => void,
};

const SideBarContext = React.createContext<SideBarContext>({
    menuOpen: null,
    setMenuOpen: () => {},
    fold: true,
    toggleFold: () => {},
});

export const useSideBarContext = (): SideBarContext => {
    const context = React.useContext(SideBarContext);
    if (!context) {
        throw new Error(`You can't use the SideBarContext outside a SideBarProvider component.`);
    }
    return context;
};

export const SideBarProvider: React.FC<SideBarProviderProps> = ({
    children,
    defaultMenuOpen,
    defaultFold,
    onFold,
}) => {
    const [menuOpen, setMenuOpen] = React.useState<string | null>(defaultMenuOpen);
    const [fold, toggleFold] = React.useState(defaultFold);

    const context = React.useMemo(
        () => ({
            setMenuOpen,
            menuOpen,
            fold,
            toggleFold: () => {
                toggleFold(!fold);
                if (onFold) onFold(!fold);
            },
        }),
        [setMenuOpen, menuOpen, fold, toggleFold],
    );

    return <SideBarContext.Provider value={context}>{children}</SideBarContext.Provider>;
};
