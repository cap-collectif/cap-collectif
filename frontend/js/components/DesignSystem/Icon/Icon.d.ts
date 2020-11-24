import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';
import { ComponentProps } from 'react';
import { ICON_SIZE } from './Icon';

declare const Icon: PolymorphicComponent<ComponentProps<SVGElement> & {
    name: string,
    size?: string,
    color?: string,
}>

export default Icon
