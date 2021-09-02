// @flow
import * as React from 'react';
import Tippy from '@tippyjs/react/headless';
import { useMenuState } from 'reakit/Menu';
import MenuButton from './MenuButton';
import MenuDivider from './MenuDivider';
import MenuList from './MenuList';
import MenuListItem from './MenuListItem';
import MenuOptionGroup from './MenuOptionGroup';
import MenuOptionItem from './MenuOptionItem';

import { MenuContext } from '~ds/Menu/Menu.context';
import type { TippyPlacementProps } from '~ds/common.type';
import type { Context } from '~ds/Menu/Menu.context';
import AppBox from '~ui/Primitives/AppBox';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

type Props = {|
  ...AppBoxProps,
  ...TippyPlacementProps,
  +loop?: boolean,
  +hideOnClickOutside?: boolean,
  +closeOnSelect?: boolean,
  +children: React.Node,
|};

export const TRANSITION_DURATION = 0.2;

const Menu = ({
  placement = 'bottom-end',
  closeOnSelect = true,
  loop = false,
  hideOnClickOutside = true,
  children,
  ...rest
}: Props) => {
  const button = React.Children.toArray(children).find((c: any) => c.type === MenuButton);
  const list = React.Children.toArray(children).find((c: any) => c.type === MenuList);
  const menu = useMenuState({ animated: TRANSITION_DURATION * 1000, loop, placement });
  const context = React.useMemo<Context>(
    () => ({ reakitMenu: menu, closeOnSelect, hideOnClickOutside }),
    [menu, closeOnSelect, hideOnClickOutside],
  );

  return (
    <MenuContext.Provider value={context}>
      <AppBox position="relative" display="inline-block" {...rest}>
        <Tippy
          zIndex={1000}
          placement={placement}
          render={attrs => (list ? React.cloneElement(list, attrs) : null)}
          animation
          visible={menu.visible}
          popperOptions={{
            strategy: 'fixed',
          }}>
          {button}
        </Tippy>
      </AppBox>
    </MenuContext.Provider>
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
