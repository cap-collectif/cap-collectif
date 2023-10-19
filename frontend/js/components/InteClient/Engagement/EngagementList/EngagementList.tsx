// @ts-nocheck
import * as React from 'react'
import EngagementListContainer from './EngagementList.style'
import type { EngagementItemProps } from '../EngagementItem/EngagementItem'
import EngagementItem from '../EngagementItem/EngagementItem'

type Props = {
  engagements: Array<EngagementItemProps>
  style?: Record<string, any>
}

const EngagementList = ({ engagements, style }: Props) => (
  <EngagementListContainer style={style}>
    {engagements.map(engagement => (
      <EngagementItem {...engagement} />
    ))}
  </EngagementListContainer>
)

export default EngagementList
