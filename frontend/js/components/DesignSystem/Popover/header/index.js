// @flow
import * as React from 'react';
import Text from '~ui/Primitives/Text';
import AppBox from '~ui/Primitives/AppBox';
import { FontWeight } from '~ui/Primitives/constants';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
  children: string | React.Node,
|};

const PopoverHeader = ({ children, ...props }: Props) => (
  <AppBox mb={6} {...props}>
    {typeof children === 'string' ? (
      <Text fontWeight={FontWeight.Semibold} color="blue.900">
        {children}
      </Text>
    ) : (
      children
    )}
  </AppBox>
);

PopoverHeader.displayName = 'Popover.Header';

export default PopoverHeader;
