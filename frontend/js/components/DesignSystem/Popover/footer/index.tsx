// @ts-nocheck
import * as React from 'react'
import type { FlexProps } from '~ui/Primitives/Layout/Flex'
import Flex from '~ui/Primitives/Layout/Flex'

type Props = FlexProps & {
  children: JSX.Element | JSX.Element[] | string
}

const PopoverFooter = ({ children, ...props }: Props) => (
  <Flex direction="row" justify="flex-end" {...props}>
    {children}
  </Flex>
)

PopoverFooter.displayName = 'Popover.Footer'
export default PopoverFooter
