// @flow
import * as React from 'react';
import Text, { type TextProps } from '~ui/Primitives/Text';

type Props = {|
  ...TextProps,
  +children: React.Node,
|};

const Description = ({ children, ...rest }: Props) => (
  <Text color="gray.600" {...rest}>
    {children}
  </Text>
);

export default Description;
