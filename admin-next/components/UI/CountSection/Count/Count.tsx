import type { FC } from 'react'
import { CapUIFontSize, CapUIFontWeight, CapUILineHeight, Text, TextProps } from '@cap-collectif/ui'
import { formatBigNumber } from '@utils/format-number'

interface CountProps extends TextProps {}

const Count: FC<CountProps> = ({ children, ...rest }: CountProps) => (
  <Text
    fontSize={CapUIFontSize.DisplaySmall}
    lineHeight={CapUILineHeight.L}
    fontWeight={CapUIFontWeight.Semibold}
    className="count-section__count"
    {...rest}
  >
    {typeof children === 'string' || typeof children === 'number' ? formatBigNumber(children) : children}
  </Text>
)

export default Count
