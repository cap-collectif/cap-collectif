// @flow
import * as React from 'react';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import AppBox from '~ui/Primitives/AppBox';

type Props = {|
  ...AppBoxProps,
|};

const MenuListGroup = ({ children, ...props }: Props) => {
  return (
    <AppBox p={4} bg="gray.100" borderBottom="normal" borderColor="gray.150" {...props}>
      {children}
    </AppBox>
  );
};

MenuListGroup.displayName = 'Menu.ListGroup';

export default MenuListGroup;
