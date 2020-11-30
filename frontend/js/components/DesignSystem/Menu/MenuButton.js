// @flow
import * as React from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type RenderProps = (props: { +open: boolean }) => React.Node;

type Props = {|
  ...AppBoxProps,
  +children: RenderProps | React.Node,
|};

export const MENU_BUTTON_TYPE: 'MenuButton' = 'MenuButton';

const MenuButton = React.forwardRef<Props, HTMLButtonElement>(({ ...props }: Props, ref) => {
  return <HeadlessMenu.Button ref={ref} {...props} />;
});

// When using forwardRef, it does not understand defaultProps but it is working
// I need those defaultProps in `Menu.js` component to filter the children and wrap them with Tippy to
// have a correct positionnable dropdown element but keeping the same Menu component API
// $FlowFixMe
MenuButton.defaultProps = {
  __type: MENU_BUTTON_TYPE,
};

MenuButton.displayName = 'Menu.Button';

export default MenuButton;
