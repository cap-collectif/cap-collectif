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
    const {
      children,
      popoverId,
      show,
    } = this.props;
    if (!show) {
      return children;
    }

    return (
      <OverlayTrigger placement="top" overlay={
        <Popover id={popoverId} title={this.getIntlMessage('proposal.vote.not_enough_credits')}>
          {this.getIntlMessage('proposal.vote.not_enough_credits_text')}
        </Popover>
      }>
        {children}
      </OverlayTrigger>
    );
  },

});

export default VoteButtonOverlay;
