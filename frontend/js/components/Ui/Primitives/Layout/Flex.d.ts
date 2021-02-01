// adapted from https://github.com/chakra-ui/chakra-ui/blob/fd75ad9f4aa570184ea88ea6ff0f99ad0d6fb818/packages/layout/src/flex.tsx
import { AppBoxOwnProps } from '../AppBox'
import {FlexboxProps} from 'styled-system'
import {FC} from 'react'

export interface FlexOptions {
    align?: FlexboxProps["alignItems"]
    justify?: FlexboxProps["justifyContent"]
    wrap?: FlexboxProps["flexWrap"]
    direction?: FlexboxProps["flexDirection"]
    basis?: FlexboxProps["flexBasis"]
    grow?: FlexboxProps["flexGrow"]
    shrink?: FlexboxProps["flexShrink"],
    spacing?: number | string
}

export type FlexProps = Omit<
    AppBoxOwnProps,
    'flexDirection' |
    'alignItems' |
    'justifyContent' |
    'flexWrap' |
    'flexBasis' |
    'flexGrow'
> & FlexOptions

declare const Flex: FC<FlexProps>

export default Flex
