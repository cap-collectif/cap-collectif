import { FC } from 'react';
import { CommonProps } from './common';
import MenuButton from './MenuButton';
import MenuList from './MenuList';
import MenuListItem from './MenuListItem';
import MenuDivider from './MenuDivider';
import MenuOptionGroup from './MenuOptionGroup';
import MenuOptionItem from './MenuOptionItem';
import { TippyPlacementProps } from '../common';
import { TippyProps } from '@tippyjs/react';
import { MenuInitialState, MenuProps } from 'reakit/Menu';

type Props = CommonProps & TippyPlacementProps &
    Partial<Pick<TippyProps, 'placement'>> &
    Partial<Pick<MenuInitialState, 'loop'>> &
    Partial<Pick<MenuProps, 'hideOnClickOutside'>> &
    {
        readonly closeOnSelect?: boolean
    }

declare const Menu: FC<Props> & {
    Button: typeof MenuButton
    List: typeof MenuList
    ListItem: typeof MenuListItem
    Divider: typeof MenuDivider
    OptionGroup: typeof MenuOptionGroup
    OptionItem: typeof MenuOptionItem
};

export default Menu;
