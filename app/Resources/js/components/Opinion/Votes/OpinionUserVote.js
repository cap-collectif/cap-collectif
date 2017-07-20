// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import UserAvatar from '../../User/UserAvatar';

const OpinionUserVote = React.createClass({
  propTypes: {
    vote: PropTypes.object.isRequired,
    style: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      style: {},
    };
  },

  render() {
    const {
      vote,
      style,
    } = this.props;
    return (
      <OverlayTrigger placement="top" overlay={
          <Tooltip id={`opinion-vote-tooltip-${vote.id}`}>
            {vote.user.displayName}
          </Tooltip>
        }
      >
        <UserAvatar user={vote.user} style={style} />
      </OverlayTrigger>
    );
  },

});

export default OpinionUserVote;
