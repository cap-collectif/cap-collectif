import cn from 'classnames'
import * as React from 'react'

import { Flex, FlexProps } from '@cap-collectif/ui'

export interface NavBarItemProps extends FlexProps {}

export const NavBarItem: React.FC<NavBarItemProps> = React.forwardRef(({ children, className, ...rest }, ref) => (
  <Flex
    as="button"
    type="button"
    className={cn('navBar__item', className)}
    px={4}
    height="100%"
    borderLeft="normal"
    borderColor="gray.150"
    align="center"
    color="gray.700"
    _hover={{
      color: 'gray.900',
    }}
    ref={ref}
    {...rest}
  >
    {children}
  </Flex>
))

NavBarItem.displayName = 'NavBar.Item'

export default NavBarItem
