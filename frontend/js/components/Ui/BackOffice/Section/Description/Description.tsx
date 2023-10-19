import * as React from 'react'
import type { TextProps } from '~ui/Primitives/Text'
import Text from '~ui/Primitives/Text'
type Props = TextProps & {
  readonly children: JSX.Element | JSX.Element[] | string
}

const Description = ({ children, ...rest }: Props) => (
  <Text color="gray.600" {...rest}>
    {children}
  </Text>
)

export default Description
