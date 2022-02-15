import { AppBoxProps, PolymorphicComponent } from '../../Ui/Primitives/AppBox';
import { FunctionComponentElement, ReactNode } from 'react';

export type TooltipProps = AppBoxProps & {
    readonly children: FunctionComponentElement<any>
    readonly visible?: boolean
    readonly label: ReactNode
    readonly baseId?: string
}

declare const Tooltip: PolymorphicComponent<TooltipProps>

export default Tooltip
