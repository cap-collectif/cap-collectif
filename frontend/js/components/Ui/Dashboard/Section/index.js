// @flow
import * as React from 'react';
import Flex, { type FlexProps } from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';

export type SectionProps = {|
  ...FlexProps,
  children: React.Node,
  label: string,
|};

const Section = ({ children, label, ...props }: SectionProps) => (
  <Flex
    direction="column"
    spacing={6}
    px={6}
    py={4}
    border="normal"
    borderColor="gray.150"
    borderRadius="normal"
    bg="white"
    {...props}>
    <Text color="blue.800">{label}</Text>
    {children}
  </Flex>
);

export default Section;
