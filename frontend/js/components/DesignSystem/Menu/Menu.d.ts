import { FC } from 'react';
import { CommonProps } from './common';
import MenuButton from './MenuButton';
import MenuList from './MenuList';
import MenuListItem from './MenuListItem';
import MenuDivider from './MenuDivider';
import MenuListGroup from './MenuListGroup';
import MenuOptionGroup from './MenuOptionGroup';
import MenuOptionItem from './MenuOptionItem';
import { TippyPlacementProps } from '../common';

type Props = CommonProps & TippyPlacementProps & {
  readonly closeOnSelect?: boolean
}

declare const Menu: FC<Props> & {
    Button: typeof MenuButton
    List: typeof MenuList
    ListItem: typeof MenuListItem
    ListGroup: typeof MenuListGroup
    Divider: typeof MenuDivider
    OptionGroup: typeof MenuOptionGroup
    OptionItem: typeof MenuOptionItem
}

export default Menu;
