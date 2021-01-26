// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import PopoverHeader from '../header';
import PopoverBody from '../body';
import PopoverFooter from '../footer';
import type { FlexProps } from '~ui/Primitives/Layout/Flex';

export const POPOVER_CONTENT_TYPE: 'PopoverContent' = 'PopoverContent';

type Props = {|
  ...FlexProps,
  children:
    | React.ChildrenArray<
        | React.Element<typeof PopoverHeader>
        | React.Element<typeof PopoverBody>
        | React.Element<typeof PopoverFooter>,
      >
    | ((render: { closePopover?: () => void }) => React.Element<typeof React.Fragment>),
  closePopover?: () => void,
|};

const PopoverContent = React.forwardRef<Props, HTMLElement>(
  ({ children, closePopover, ...props }: Props, ref) => (
    <Flex
      direction="column"
      p={4}
      bg="white"
      color="gray.900"
      borderRadius="popover"
      boxShadow="medium"
      width="300px"
      maxWidth="300px"
      ref={ref}
      {...props}>
      {typeof children === 'function' ? children({ closePopover }) : children}
    </Flex>
  ),
);

PopoverContent.name = POPOVER_CONTENT_TYPE;
PopoverContent.displayName = 'Popover.Content';

export default PopoverContent;
