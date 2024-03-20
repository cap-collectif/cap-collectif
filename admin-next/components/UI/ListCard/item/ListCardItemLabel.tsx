import type { FC } from 'react'
import { CapUIFontWeight, TextProps, Text } from '@cap-collectif/ui'

export interface ListCardItemLabelProps extends TextProps {}

const ListCardItemLabel: FC<ListCardItemLabelProps> = ({ children, ...rest }) => (
  <Text color="gray.900" fontWeight={CapUIFontWeight.Semibold} {...rest}>
    {children}
  </Text>
)

export default ListCardItemLabel
