import { ReactChild } from 'react';
import { PolymorphicComponent } from '../../../Ui/Primitives/AppBox';

type Props = {
    readonly isNumeric?: boolean,
    readonly noPlaceholder?: boolean,
    readonly children?: ReactChild | (({ styles: DefaultStyles }) => ReactChild),
}

declare const Th: PolymorphicComponent<Props>;

export default Th;
