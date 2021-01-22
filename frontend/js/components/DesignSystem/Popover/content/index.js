// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import PopoverHeader from '../header';
import PopoverBody from '../body';
import PopoverFooter from '../footer';
import type { FlexProps } from '~ui/Primitives/Layout/Flex';

type Props = {|
  ...FlexProps,
  children: React.ChildrenArray<
    | React.Element<typeof PopoverHeader>
    | React.Element<typeof PopoverBody>
    | React.Element<typeof PopoverFooter>,
  >,
|};

const PopoverContent = ({ children, ...props }: Props) => (
  <Flex
    direction="column"
    p={4}
    bg="white"
    color="gray.900"
    borderRadius="popover"
    boxShadow="medium"
    width="300px"
    maxWidth="300px"
    {...props}>
    {children}
  </Flex>
);

PopoverContent.displayName = 'Popover.Content';

export default PopoverContent;
