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

// So that we can use MenuButton as a real Button
const MenuButton = React.forwardRef<any, HTMLButtonElement>(({ ...props }: Props, ref) => {
  return <HeadlessMenu.Button ref={ref} {...props} />;
});

MenuButton.name = MENU_BUTTON_TYPE;
MenuButton.displayName = 'Menu.Button';

export default MenuButton;
