import { $Values } from 'utility-types'
import * as React from 'react'
import Icon, { ICON_NAME } from './Icon'

type Props = {
  name: $Values<typeof ICON_NAME>
  className?: string
  size?: number
}

const SocialIcon = ({ className, name, ...rest }: Props) => (
  <span
    style={{
      lineHeight: 'inherit',
    }}
    className={className}
  >
    <Icon name={name} {...rest} />
  </span>
)

export default SocialIcon
