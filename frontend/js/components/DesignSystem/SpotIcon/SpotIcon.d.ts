import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';
import { ComponentProps } from 'react';

declare export const SPOT_ICON_NAME = {
    PENCIL_SOFTWARE: 'PENCIL_SOFTWARE',
    EMAIL_TIMEOUT: 'EMAIL_TIMEOUT',
    EMAIL_SEND: 'EMAIL_SEND',
    RATING_CLICK: 'RATING_CLICK',
    DELETE: 'DELETE',
};

declare const SpotIcon: PolymorphicComponent<ComponentProps<SVGElement> & {
    name: keyof typeof SPOT_ICON_NAME,
    size?: 'sm' | 'md' | 'lg' | string,
    color?: string,
}>

export default SpotIcon;
