import { ComponentProps } from 'react';
import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';

type Props = ComponentProps<"a"> & {
    readonly href: string,
    readonly truncate?: number
}

declare const Link: PolymorphicComponent<Props>

export default Link;
