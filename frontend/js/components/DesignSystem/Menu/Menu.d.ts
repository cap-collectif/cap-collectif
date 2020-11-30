import { FC } from 'react';
import { CommonProps } from './common';
import MenuButton from './MenuButton';
import MenuList from './MenuList';
import MenuListItem from './MenuListItem';
import MenuDivider from './MenuDivider';
import MenuListGroup from './MenuListGroup';

type Props = CommonProps & {
    readonly placement?: 'auto-start'
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
        | 'left-start'
}

declare const Menu: FC<Props> & {
    Button: typeof MenuButton
    List: typeof MenuList
    ListItem: typeof MenuListItem
    ListGroup: typeof MenuListGroup
    Divider: typeof MenuDivider
}

export default Menu;
