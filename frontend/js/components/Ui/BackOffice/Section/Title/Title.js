// @flow
import * as React from 'react';
import { headingStyles } from '~ui/Primitives/Heading';
import { FontWeight } from '~ui/Primitives/constants';
import Text, { type TextProps } from '~ui/Primitives/Text';

type Props = {|
  ...TextProps,
  +children: React.Node,
|};

const Title = ({ children, ...rest }: Props) => (
  <Text {...headingStyles.h4} fontWeight={FontWeight.Semibold} color="blue.800" {...rest}>
    {children}
  </Text>
);

export default Title;
