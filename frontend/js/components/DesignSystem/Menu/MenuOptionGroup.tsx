// @ts-nocheck
import * as React from 'react'
import { useMemo } from 'react'
import css from '@styled-system/css'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import AppBox from '~ui/Primitives/AppBox'
import type { Context } from '~ds/Menu/MenuOptionGroup.context'
import { MenuOptionGroupContext } from '~ds/Menu/MenuOptionGroup.context'
import Text from '~ui/Primitives/Text'

type MenuOptionGroup = {
  type: 'checkbox' | 'radio'
  title?: JSX.Element | JSX.Element[] | string
  titleBackgroundColor?: string
  value?: string | string[]
  onChange?: (newValue: string | string[]) => void
  uppercase?: boolean
  children?: JSX.Element | JSX.Element[]
}

type Props = Omit<AppBoxProps, 'type' | 'onChange'> & MenuOptionGroup

const MenuOptionGroup = ({
  children,
  title,
  value,
  onChange,
  type,
  titleBackgroundColor,
  uppercase = true,
  ...props
}: Props): JSX.Element => {
  const context = useMemo<Context>(
    () => ({
      onChange,
      value,
      type,
    }),
    [onChange, value, type],
  )
  return (
    <MenuOptionGroupContext.Provider value={context}>
      <AppBox
        css={css({
          pointerEvents: 'all',
          '&:first-of-type .menu__option__group--title': {
            borderTop: 'none',
          },
        })}
        role="group"
        {...props}
      >
        {title && (
          <Text
            className="menu__option__group--title"
            color="gray.900"
            backgroundColor={titleBackgroundColor}
            lineHeight="sm"
            fontSize={1}
            fontWeight="semibold"
            px={3}
            py={2}
            bg="gray.100"
            borderBottom="normal"
            borderTop="normal"
            borderColor="gray.300"
            uppercase={uppercase}
          >
            {title}
          </Text>
        )}
        {children}
      </AppBox>
    </MenuOptionGroupContext.Provider>
  )
}

MenuOptionGroup.displayName = 'Menu.OptionGroup'
export default MenuOptionGroup
