import React, { PropTypes, cloneElement } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { OverlayTrigger, Popover } from 'react-bootstrap';

const VoteButtonOverlay = React.createClass({
  propTypes: {
    children: PropTypes.element.isRequired,
    userHasVote: PropTypes.bool.isRequired,
    popoverId: PropTypes.string.isRequired,
    hasReachedLimit: PropTypes.bool,
    hasUserEnoughCredits: PropTypes.bool,
    limit: PropTypes.number,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      hasReachedLimit: false,
      hasUserEnoughCredits: true,
    };
  },

  render() {
    const {
      children,
      popoverId,
      userHasVote,
      hasReachedLimit,
      hasUserEnoughCredits,
      limit,
    } = this.props;
    if (userHasVote || (hasUserEnoughCredits && !hasReachedLimit)) {
      return children;
    }
    let title = '';
    let content = '';
    let help = '';
    if (!hasUserEnoughCredits && hasReachedLimit) {
      title = this.getIntlMessage('proposal.vote.popover.limit_reached_and_not_enough_credits_title');
      content = (
        <FormattedMessage
          message={this.getIntlMessage('proposal.vote.popover.limit_reached_and_not_enough_credits_text')}
          num={limit}
        />
      );
      help = this.getIntlMessage('proposal.vote.popover.limit_reached_and_not_enough_credits_help');
    } else if (!hasUserEnoughCredits) {
      title = this.getIntlMessage('proposal.vote.popover.not_enough_credits_title');
      content = this.getIntlMessage('proposal.vote.popover.not_enough_credits_text');
      help = this.getIntlMessage('proposal.vote.popover.not_enough_credits_help');
    } else if (hasReachedLimit) {
      title = this.getIntlMessage('proposal.vote.popover.limit_reached_title');
      content = (
        <FormattedMessage
          message={this.getIntlMessage('proposal.vote.popover.limit_reached_text')}
          num={limit}
        />
      );
      help = this.getIntlMessage('proposal.vote.popover.limit_reached_help');
    }
    const overlay = (
      <Popover id={popoverId} title={title}>
        {content}
        <p className="excerpt" style={{ marginTop: 10 }}>
          {help}
        </p>
      </Popover>
    );
    return (
      <OverlayTrigger
        placement="top"
        overlay={overlay}
      >
        <span style={{ cursor: 'not-allowed' }}>
          { cloneElement(children, { disabled: true, style: { ...children.props.style, pointerEvents: 'none' } }) }
        </span>
      </OverlayTrigger>
    );
  },

});

export default VoteButtonOverlay;
