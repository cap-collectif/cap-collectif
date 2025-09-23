import cn from 'classnames'
import * as React from 'react'

import { Flex, FlexProps } from '@cap-collectif/ui'
import NavBarItem from './item/NavBarItem'
import NavBarTitle from './title/NavBarTitle'
import NavBarList from './list/NavBarList'
import NavBarData from './data/NavBarData'

export interface NavBarProps extends FlexProps {}

type SubComponents = {
  Title: typeof NavBarTitle
  List: typeof NavBarList
  Item: typeof NavBarItem
  Data: typeof NavBarData
}

export const NavBar: React.FC<NavBarProps> & SubComponents = ({ children, className, ...props }) => (
  <Flex
    as="nav"
    role="navigation"
    direction="row"
    bg="white"
    justify="space-between"
    align="center"
    pl={6}
    minHeight={11}
    className={cn('navBar', className)}
    borderBottom="normal"
    borderColor="gray.150"
    {...props}
  >
    {children}
  </Flex>
)

NavBar.displayName = 'NavBar'

NavBar.Title = NavBarTitle
NavBar.List = NavBarList
NavBar.Item = NavBarItem
NavBar.Data = NavBarData

export default NavBar
