import React from 'react'
import { Box, CapUIIcon, CapUIIconSize, Flex, Icon } from '@cap-collectif/ui'

export const CheckInfo: React.FC<{ checked?: boolean; label: string; cross?: boolean }> = ({
  checked,
  label,
  cross = false,
}) => (
  <Flex alignItems="center">
    <Icon name={CapUIIcon.Check} color={checked ? 'green.500' : 'neutral-gray.300'} size={CapUIIconSize.Md} />
    <Box
      ml={1}
      sx={{ textDecoration: checked && cross ? 'line-through' : null }}
      color={checked ? 'neutral-gray.500' : 'neutral-gray.900'}
    >
      {label}
    </Box>
  </Flex>
)

export default CheckInfo
