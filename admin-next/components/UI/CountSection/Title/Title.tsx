import type { FC } from 'react'
import { Text, TextProps, headingStyles } from '@cap-collectif/ui'
import cn from 'classnames'

interface TitleProps extends TextProps {}

const Title: FC<TitleProps> = ({ children, className, ...rest }) => (
  <Text {...headingStyles.h4} className={cn('count-section__title', className)} {...rest}>
    {children}
  </Text>
)

export default Title
