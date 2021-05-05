import { ReactNode } from 'react';
import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox';
import Tr from '../Tr';

type Props = {
    readonly children: Tr[],
    readonly onScrollToBottom?: () => void,
    readonly useInfiniteScroll?: boolean,
    readonly hasMore?: boolean,
    readonly loader?: ReactNode,
}

declare const Tbody: PolymorphicComponent<Props>;

export default Tbody;
