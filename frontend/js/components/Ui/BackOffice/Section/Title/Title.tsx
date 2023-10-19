import * as React from 'react'
import { headingStyles } from '~ui/Primitives/Heading'
import { FontWeight } from '~ui/Primitives/constants'
import type { TextProps } from '~ui/Primitives/Text'
import Text from '~ui/Primitives/Text'
type Props = TextProps & {
  readonly children: JSX.Element | JSX.Element[] | string
}

const Title = ({ children, ...rest }: Props) => (
  <Text {...headingStyles.h4} fontWeight={FontWeight.Semibold} color="blue.800" {...rest}>
    {children}
  </Text>
)

export default Title
