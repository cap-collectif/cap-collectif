// @flow
import * as React from 'react';
import Flex, { type FlexProps } from '~ui/Primitives/Layout/Flex';
import Skeleton from '~ds/Skeleton';

type Props = {|
  ...FlexProps,
  children: React.Node,
|};

const SectionPlaceholder = ({ children, ...props }: Props) => (
  <Flex
    direction="column"
    spacing={7}
    px={6}
    py={4}
    border="normal"
    borderColor="gray.150"
    borderRadius="normal"
    bg="white"
    {...props}>
    <Skeleton.Text size="sm" width="250px" />

    {children}
  </Flex>
);

export default SectionPlaceholder;
