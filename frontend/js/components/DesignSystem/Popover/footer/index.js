// @flow
import * as React from 'react';
import Flex, { type FlexProps } from '~ui/Primitives/Layout/Flex';

type Props = {|
  ...FlexProps,
  children: React.Node,
|};

const PopoverFooter = ({ children, ...props }: Props) => (
  <Flex direction="row" justify="flex-end" {...props}>
    {children}
  </Flex>
);

PopoverFooter.displayName = 'Popover.Footer';

export default PopoverFooter;
