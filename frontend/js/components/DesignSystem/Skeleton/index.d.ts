import type { ReactNode } from 'react';

type Props = {
    readonly isLoaded: boolean,
    readonly children: ReactNode,
    readonly placeholder: ReactNode,
    readonly animate?: boolean,
}

declare const Skeleton: Props;

export default Skeleton;
