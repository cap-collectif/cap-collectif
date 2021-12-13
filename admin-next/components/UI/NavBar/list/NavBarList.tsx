import cn from 'classnames';
import * as React from 'react';

import { Flex, FlexProps } from '@cap-collectif/ui';

export interface NavBarListProps extends FlexProps {}

export const NavBarList: React.FC<NavBarListProps> = ({ children, className, ...rest }) => (
    <Flex
        direction="row"
        align="center"
        height="100%"
        className={cn('navBar__list', className)}
        {...rest}>
        {children}
    </Flex>
);

NavBarList.displayName = 'NavBar.List';

export default NavBarList;
