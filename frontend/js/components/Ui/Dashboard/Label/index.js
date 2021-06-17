// @flow
import * as React from 'react';
import Flex, { type FlexProps } from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';

export type LabelProps = {|
  ...FlexProps,
  children: string | React.Node,
  circleColor: string,
  state: 'idle' | 'hidden',
|};

const Label = ({ children, circleColor, state, ...props }: LabelProps) => (
  <Flex
    direction="row"
    spacing={2}
    align="center"
    opacity={state === 'hidden' ? 0.5 : 1}
    {...props}>
    <AppBox bg={circleColor} width={2} height={2} borderRadius="50%" flexShrink={0} />
    {typeof children === 'string' ? <Text color="gray.900">{children}</Text> : children}
  </Flex>
);

export default Label;
