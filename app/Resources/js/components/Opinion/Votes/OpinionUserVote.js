import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import UserAvatar from '../../User/UserAvatar';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

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
    const { vote } = this.props;
    return (
      <OverlayTrigger placement="top" overlay={
          <Tooltip id={'opinion-vote-tooltip-' + vote.id}>
            {vote.user.displayName}
          </Tooltip>
        }>
        <UserAvatar key={vote.user.id} user={vote.user} style={this.props.style} />
      </OverlayTrigger>
    );
  },

});

export default OpinionUserVote;
