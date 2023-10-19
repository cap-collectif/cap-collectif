// @ts-nocheck
import * as React from 'react'
import { Flex, Text, Box } from '@cap-collectif/ui'
import { SPACES_SCALES } from '~/styles/theme/base'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import { useListOptionGroup } from '~ds/List/ListOptionGroup.context'
import { LineHeight } from '~ui/Primitives/constants'
type Props = AppBoxProps & {
  readonly value: string
  readonly disabled?: boolean
  readonly children?: JSX.Element | JSX.Element[] | string
}

const ListOptionGroupItem = ({ children, value, ...props }: Props) => {
  const { type, onChange, value: originalValue } = useListOptionGroup()
  const isSelected = Array.isArray(originalValue) ? originalValue.includes(value) : originalValue === value
  return (
    <Flex
      px={3}
      py={2}
      align="center"
      lineHeight="base"
      sx={{
        '&:hover': {
          cursor: 'pointer',
        },
      }}
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
      <Box
        display="inline-block"
        as="input"
        lineHeight={LineHeight.Base}
        checked={isSelected}
        sx={{
          pointerEvents: 'none',
          mt: '0 !important',
          mr: `${SPACES_SCALES[2]} !important`,
        }}
        type={type}
      />
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </Flex>
  )
}

ListOptionGroupItem.displayName = 'ListOptionGroup.Item'
export default ListOptionGroupItem
