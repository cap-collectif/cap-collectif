import React from 'react';
import { IntlMixin } from 'react-intl';
import { OverlayTrigger, Popover } from 'react-bootstrap';

const VoteButtonOverlay = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    show: React.PropTypes.bool.isRequired,
    popoverId: React.PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  // We add tooltip if user has not enough credits
  render() {
    if (!this.props.show) {
      return this.props.children;
    }

    return (
      <OverlayTrigger placement="top" overlay={
        <Popover id={this.props.popoverId} title={this.getIntlMessage('proposal.vote.not_enough_credits')}>
          {this.getIntlMessage('proposal.vote.not_enough_credits_text')}
        </Popover>
      }>
        {this.props.children}
      </OverlayTrigger>
    );
  },

});

export default VoteButtonOverlay;
