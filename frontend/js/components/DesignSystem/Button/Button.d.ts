import {PolymorphicComponent} from '../../Ui/Primitives/AppBox';
import { ComponentProps } from 'react';

declare const Button: PolymorphicComponent<ComponentProps<"button"> & {
    size?: 'small' | 'medium' | 'big',
    icon?: string,
    alternative?: boolean,
    variant: 'primary' | 'secondary' | 'tertiary' | 'link',
    variantColor?: 'default' | 'danger'
}>

export default Button
