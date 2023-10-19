// @ts-nocheck
import { PolymorphicComponent } from '../../Ui/Primitives/AppBox'
import { ComponentProps } from 'react'

declare const Spinner: PolymorphicComponent<
  ComponentProps<SVGElement> & {
    size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | string
    color?: string
  }
>

export default Spinner
