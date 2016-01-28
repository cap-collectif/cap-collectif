import React from 'react';
import {IntlMixin} from 'react-intl';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

const VoteButtonOverlay = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    show: React.PropTypes.bool.isRequired,
    tooltipId: React.PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  // We add tooltip if user has not enough credits
  render() {
    if (!this.props.show) {
      return this.props.children;
    }

    return (
      <OverlayTrigger placement="top" overlay={
        <Tooltip id={this.props.tooltipId}>
          {this.getIntlMessage('proposal.vote.not_enough_credits')}
        </Tooltip>
      }>
        {this.props.children}
      </OverlayTrigger>
    );
  },

});

export default VoteButtonOverlay;
