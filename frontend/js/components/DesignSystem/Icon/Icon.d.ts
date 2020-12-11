import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';
import { ComponentProps } from 'react';

declare export const ICON_NAME = {
    TRASH: 'TRASH',
    PENCIL: 'PENCIL',
    USER: 'USER',
    CLOCK_O: 'CLOCK_O',
    CLOCK: 'CLOCK',
    CALENDAR_O: 'CALENDAR_O',
    CALENDAR: 'CALENDAR',
    ARROW_LEFT_O: 'ARROW_LEFT_O',
    ARROW_RIGHT_O: 'ARROW_RIGHT_O',
    ARROW_DOWN_O: 'ARROW_DOWN_O',
    ARROW_UP_O: 'ARROW_UP_O',
    ARROW_LEFT: 'ARROW_LEFT',
    ARROW_RIGHT: 'ARROW_RIGHT',
    ARROW_DOWN: 'ARROW_DOWN',
    ARROW_UP: 'ARROW_UP',
    ADD: 'ADD',
    CROSS: 'CROSS',
    CIRCLE_INFO: 'CIRCLE_INFO',
    CIRCLE_ALERT: 'CIRCLE_ALERT',
    CIRCLE_CHECK: 'CIRCLE_CHECK',
    CIRCLE_CROSS: 'CIRCLE_CROSS',
    NEWSPAPER: 'NEWSPAPER',
    SPINNER: 'SPINNER',
    BELL: 'BELL',
};

declare const Icon: PolymorphicComponent<ComponentProps<SVGElement> & {
    name: keyof typeof ICON_NAME,
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | string,
    color?: string,
}>

export default Icon
