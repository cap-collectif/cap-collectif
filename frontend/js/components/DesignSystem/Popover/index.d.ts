// @ts-nocheck
import { PolymorphicComponent } from '../../Ui/Primitives/AppBox'
import { TippyPlacementProps } from '../common'
import { TippyProps as TippyPropsType } from '@tippyjs/react'

type Props = TippyPlacementProps &
  Partial<Pick<TippyPropsType, 'delay' | 'showOnCreate' | 'onShow' | 'onHide'>> & {
    readonly trigger?: Array<'mouseenter' | 'focus' | 'click' | 'focusin' | 'manual'>
    readonly useArrow?: boolean
    readonly keepOnHover?: boolean
  }

declare const Popover: PolymorphicComponent<Props>

export default Popover
