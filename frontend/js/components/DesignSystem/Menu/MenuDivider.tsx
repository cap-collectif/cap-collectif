// @ts-nocheck
import * as React from 'react'
import AppBox from '~ui/Primitives/AppBox'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'

type Props = AppBoxProps

const MenuDivider = ({ ...props }: Props) => {
  return (
    <AppBox
      role="separator"
      as="hr"
      border={0}
      borderBottom="normal"
      borderColor="gray.150"
      width="100%"
      my={2}
      {...props}
    />
  )
}

MenuDivider.displayName = 'Menu.Divider'
export default MenuDivider
