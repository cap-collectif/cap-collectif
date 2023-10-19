// @ts-nocheck
import * as React from 'react'
import css from '@styled-system/css'
import type { Props as ListItemProps } from './MenuListItem'
import MenuListItem from './MenuListItem'
import { useMenuOptionGroup } from '~ds/Menu/MenuOptionGroup.context'
import AppBox from '~ui/Primitives/AppBox'
import { SPACES_SCALES } from '~/styles/theme/base'
type Props = ListItemProps & {
  readonly value: string
}

const MenuOptionItem = ({ children, value, ...props }: Props) => {
  const { type, onChange, value: originalValue } = useMenuOptionGroup()
  const isSelected = Array.isArray(originalValue) ? originalValue.includes(value) : originalValue === value
  return (
    <MenuListItem
      {...props}
      onClick={() => {
        if (onChange) {
          if (Array.isArray(originalValue)) {
            onChange(isSelected ? originalValue.filter(v => v !== value) : [...originalValue, value])
          } else {
            onChange(value)
          }
        }
      }}
    >
      <AppBox
        display="inline-block"
        as="input"
        checked={isSelected}
        css={css({
          pointerEvents: 'none',
          mt: '0 !important',
          mr: `${SPACES_SCALES[2]} !important`,
        })}
        type={type}
      />
      {children}
    </MenuListItem>
  )
}

MenuOptionItem.displayName = 'Menu.OptionItem'
export default MenuOptionItem
