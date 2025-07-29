import cn from 'classnames'
import * as React from 'react'

import { headingStyles, Text, TextProps } from '@cap-collectif/ui'

export interface NavBarTitleProps extends TextProps {}

export const NavBarTitle: React.FC<NavBarTitleProps> = ({ children, className, ...rest }) => (
  <Text {...headingStyles.h4} color="blue.800" className={cn('navBar__title', className)} {...rest}>
    {children}
  </Text>
)

NavBarTitle.displayName = 'NavBar.Title'

export default NavBarTitle
