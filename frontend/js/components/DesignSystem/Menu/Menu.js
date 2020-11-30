// @flow
import * as React from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import Tippy from '@tippyjs/react/headless';
import { MenuButton, MenuDivider, MenuList, MenuListItem, MenuListGroup } from './index';
import AppBox from '~ui/Primitives/AppBox';
import { MenuContext } from '~ds/Menu/Menu.context';
import { MENU_BUTTON_TYPE } from '~ds/Menu/MenuButton';
import { MENU_LIST_TYPE } from '~ds/Menu/MenuList';

type Props = {|
  +placement?:
    | 'auto-start'
    | 'auto'
    | 'auto-end'
    | 'top-start'
    | 'top'
    | 'top-end'
    | 'right-start'
    | 'right'
    | 'right-end'
    | 'bottom-end'
    | 'bottom'
    | 'bottom-start'
    | 'left-end'
    | 'left'
    | 'left-start',
  +children: React.Node,
|};

const Provider = React.memo(
  ({ open, children }: { open: boolean, children: React.Node }) => (
    <MenuContext.Provider value={{ open }}>
      {typeof children === 'function' ? children({ open }) : children}
    </MenuContext.Provider>
  ),
  (prev, next) => prev.open === next.open,
);

const Menu = ({ placement = 'bottom-end', children }: Props) => {
  const button = React.Children.toArray(children).find(c => c.props.__type === MENU_BUTTON_TYPE);
  const list = React.Children.toArray(children).find(c => c.props.__type === MENU_LIST_TYPE);

  return (
    <AppBox position="relative" display="inline-block">
      <HeadlessMenu>
        {({ open }) => (
          <Provider open={open}>
            <Tippy
              placement={placement}
              render={attrs => (list ? React.cloneElement(list, attrs) : null)}
              animation
              interactive
              trigger="click">
              {button}
            </Tippy>
          </Provider>
        )}
      </HeadlessMenu>
    </AppBox>
  );
};

Menu.displayName = 'Menu';

Menu.Button = MenuButton;
Menu.List = MenuList;
Menu.ListItem = MenuListItem;
Menu.ListGroup = MenuListGroup;
Menu.Divider = MenuDivider;

export default Menu;
