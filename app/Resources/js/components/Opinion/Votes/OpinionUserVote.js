// @flow
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import UserAvatar from '../../User/UserAvatar';

type Props = {
  vote: Object,
  style?: Object,
};

class OpinionUserVote extends React.Component<Props> {
  static defaultProps = {
    style: {},
  };

  render() {
    const { vote, style } = this.props;
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`opinion-vote-tooltip-${vote.id}`}>{vote.user.displayName}</Tooltip>}>
        <UserAvatar user={vote.user} style={style} />
      </OverlayTrigger>
    );
  }
}

export default OpinionUserVote;
