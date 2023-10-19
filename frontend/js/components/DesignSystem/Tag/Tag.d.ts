// @ts-nocheck
import { AppBoxProps, PolymorphicComponent } from '../../Ui/Primitives/AppBox'
import { ComponentProps } from 'react'
import { ICON_NAME } from '../Icon/Icon'
import { AvatarProps } from '../Avatar/Avatar'

type Props = ComponentProps<'span'> & {
  readonly icon?: keyof typeof ICON_NAME
  readonly variantType?: 'tag' | 'badge'
  readonly avatar?: AvatarProps & { props?: AppBoxProps }
  readonly onRemove?: (e?: MouseEvent) => void
  readonly variant?: 'blue' | 'aqua' | 'red' | 'green' | 'orange' | 'yellow' | 'gray' | 'neutral-gray'
  readonly interactive?: boolean
}

declare const Tag: PolymorphicComponent<Props>

export default Tag
