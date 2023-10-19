// @ts-nocheck
import { PolymorphicComponent } from '../../Ui/Primitives/AppBox'
import { ComponentProps } from 'react'
import { ICON_NAME } from '../Icon/Icon'

export type ButtonProps = ComponentProps<'button'> & {
  variantSize?: 'small' | 'medium' | 'big'
  leftIcon?: keyof typeof ICON_NAME
  rightIcon?: keyof typeof ICON_NAME
  alternative?: boolean
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link'
  variantColor?: 'primary' | 'danger' | 'hierarchy'
}

declare const Button: PolymorphicComponent<ButtonProps>

export default Button
