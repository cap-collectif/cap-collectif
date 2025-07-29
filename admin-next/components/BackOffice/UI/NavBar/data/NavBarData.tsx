import cn from 'classnames'
import * as React from 'react'

import { CapUIFontWeight, headingStyles, Text, TextProps } from '@cap-collectif/ui'

export interface NavBarDataProps extends TextProps {}

export const NavBarData: React.FC<NavBarDataProps> = ({ children, className, ...rest }) => (
  <Text
    {...headingStyles.h5}
    color="blue.800"
    className={cn('navBar__data', className)}
    fontWeight={CapUIFontWeight.Bold}
    uppercase
    {...rest}
  >
    {children}
  </Text>
)

NavBarData.displayName = 'NavBar.Data'

export default NavBarData
