import * as React from 'react';

type LayoutContext = {
    contentRef: null | React.MutableRefObject<null>,
};

type LayoutProviderProps = {
    children: React.ReactNode,
    contentRef: null | React.MutableRefObject<null>,
};

export const LayoutContext = React.createContext<LayoutContext>({
    contentRef: null,
});

export const useLayoutContext = (): LayoutContext => {
    const context = React.useContext(LayoutContext);
    if (!context) {
        throw new Error(`You can't use the LayoutContext outside a LayoutProvider component.`);
    }
    return context;
};

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children, contentRef }) => {
    const context = React.useMemo(
        () => ({
            contentRef,
        }),
        [contentRef],
    );

    return <LayoutContext.Provider value={context}>{children}</LayoutContext.Provider>;
};
