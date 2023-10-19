// @ts-nocheck
import * as React from 'react'
import AppBox from '~ui/Primitives/AppBox'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'

type Props = AppBoxProps & {
  children: any
}

const PopoverBody = ({ children, ...props }: Props) => (
  <AppBox mb={6} color="gray.900" {...props}>
    {children}
  </AppBox>
)

PopoverBody.displayName = 'Popover.Body'
export default PopoverBody
