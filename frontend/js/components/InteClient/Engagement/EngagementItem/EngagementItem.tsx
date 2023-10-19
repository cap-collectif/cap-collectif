// @ts-nocheck
import * as React from 'react'
import EngagementItemContainer from './EngagementItem.style'
import Image from '~ui/Primitives/Image'

export type EngagementItemProps = {
  icon: string
  description: string
  link?: string
  linkText?: string
}

const EngagementItem = ({ icon, description, link, linkText }: EngagementItemProps) => (
  <EngagementItemContainer>
    <Image src={icon} alt="" aria-hidden />
    <p>{description}</p>
    {link && linkText && <a href={link}>{linkText}</a>}
  </EngagementItemContainer>
)

export default EngagementItem
