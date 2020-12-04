import { PolymorphicComponent } from '../../Ui/Primitives/AppBox';
import { TippyPlacementProps } from '../common';
import { TippyProps as TippyPropsType } from '@tippyjs/react';
import { ReactNode } from 'react'

type Props = TippyPlacementProps & Partial<Pick<TippyPropsType, 'delay' | 'showOnCreate' | 'onShow' | 'onHide' >> & {
  readonly label: ReactNode
  readonly truncate?: number
  readonly trigger?: Array<'mouseenter' | 'focus' | 'click' | 'focusin' | 'manual'>
  readonly useArrow?: boolean
  readonly isDisabled?: boolean
  readonly keepOnHover?: boolean
}

declare const Tooltip: PolymorphicComponent<Props>

export default Tooltip
