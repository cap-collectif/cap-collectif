// @ts-nocheck
import * as React from 'react'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import Flex from '~ui/Primitives/Layout/Flex'

type Props = AppBoxProps & { children?: JSX.Element | JSX.Element[] | string }
const ButtonGroup = React.forwardRef<HTMLElement, Props>(({ children, ...props }: Props, ref) => {
  return (
    <Flex ref={ref} {...props} spacing={4}>
      {children}
    </Flex>
  )
})
ButtonGroup.displayName = 'ButtonGroup'
export default ButtonGroup
