// @flow
import * as React from 'react';
import { Menu as HeadlessMenu } from '@headlessui/react';
import Tippy from '@tippyjs/react/headless';
import MenuButton, { MENU_BUTTON_TYPE } from './MenuButton';
import MenuDivider from './MenuDivider';
import MenuList, { MENU_LIST_TYPE } from './MenuList';
import MenuListItem from './MenuListItem';
import MenuOptionGroup from './MenuOptionGroup';
import MenuOptionItem from './MenuOptionItem';

import AppBox from '~ui/Primitives/AppBox';
import { MenuContext } from '~ds/Menu/Menu.context';
import type { TippyPlacementProps } from '~ds/common.type';
import type { Context } from '~ds/Menu/Menu.context';

type Props = {|
  ...TippyPlacementProps,
  +closeOnSelect?: boolean,
  +children: React.Node,
|};

const Provider = ({
  context: { open, closeOnSelect },
  children,
}: {
  context: Context,
  children: React.Node,
}) => (
  <MenuContext.Provider value={{ open, closeOnSelect }}>
    {typeof children === 'function' ? children({ open }) : children}
  </MenuContext.Provider>
);

const Menu = ({ placement = 'bottom-end', closeOnSelect = true, children }: Props) => {
  const button = React.Children.toArray(children).find(c => c.type.name === MENU_BUTTON_TYPE);
  const list = React.Children.toArray(children).find(c => c.type.name === MENU_LIST_TYPE);

  return (
    <AppBox position="relative" display="inline-block">
      <HeadlessMenu>
        {({ open }) => (
          <Provider context={{ open, closeOnSelect }}>
            <Tippy
              placement={placement}
              render={attrs => (list ? React.cloneElement(list, attrs) : null)}
              animation
              trigger="click"
              popperOptions={{
                strategy: 'fixed',
              }}>
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
Menu.Divider = MenuDivider;
Menu.OptionGroup = MenuOptionGroup;
Menu.OptionItem = MenuOptionItem;

export default Menu;
