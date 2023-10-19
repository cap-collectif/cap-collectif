import type { PropsOf } from '@emotion/react'
import styled from 'styled-components'
import {
  border,
  color,
  flexbox,
  grid,
  layout,
  position,
  shadow,
  space,
  typography,
  compose,
  system,
} from 'styled-system'
import shouldForwardProp from '@styled-system/should-forward-prop'
import type { AppBoxProps } from './AppBox.type'
import { ElementType } from 'react'

const AppBox = styled('div').withConfig({
  shouldForwardProp: prop => {
    return shouldForwardProp(prop)
  },
})<AppBoxProps>(
  props => ({
    textTransform: props.uppercase ? 'uppercase' : props.capitalize ? 'capitalize' : undefined,
  }),
  compose(
    system({
      minSize: {
        properties: ['minWidth', 'minHeight'],
        scale: 'sizes',
      },
      maxSize: {
        properties: ['maxWidth', 'maxHeight'],
        scale: 'sizes',
      },
    }),
    shadow,
    color,
    space,
    layout,
    flexbox,
    grid,
    border,
    typography,
    position,
  ),
)
AppBox.displayName = 'AppBox'
const defaultElement = 'div'

export type BoxProps = AppBoxProps

export type BoxPropsOf<C extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> = Omit<
  BoxProps,
  keyof Omit<PropsOf<C>, 'css'>
> &
  Omit<PropsOf<C>, 'css'>

export interface BoxOwnProps<E extends ElementType = ElementType> extends BoxProps {
  as?: E
}

export type PolymorphicBoxProps<E extends ElementType> = BoxOwnProps<E> & Omit<PropsOf<E>, keyof BoxOwnProps>

export type PolymorphicBox = <E extends ElementType = typeof defaultElement>(
  props: PolymorphicBoxProps<E>,
) => JSX.Element

export default AppBox as PolymorphicBox
