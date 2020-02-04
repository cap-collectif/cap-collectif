// @flow
import * as React from 'react';
import EngagementListContainer from './EngagementList.style';
import EngagementItem, { type EngagementItemProps } from '../EngagementItem/EngagementItem';

type Props = {
  engagements: Array<EngagementItemProps>,
  style?: Object,
};

const EngagementList = ({ engagements, style }: Props) => (
  <EngagementListContainer style={style}>
    {engagements.map(engagement => (
      <EngagementItem {...engagement} />
    ))}
  </EngagementListContainer>
);

export default EngagementList;
