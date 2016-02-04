import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';

const OpinionSourceVoteButton = React.createClass({
  propTypes: {
    disabled: PropTypes.bool.isRequired,
    hasVoted: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { disabled, hasVoted, onClick } = this.props;
    return (
      <Button
        disabled={disabled}
        bsStyle={hasVoted ? 'danger' : 'success'}
        className={'source__btn--vote' + (hasVoted ? '' : ' btn--outline')}
        bsSize="xsmall"
        onClick={onClick}
      >
        {hasVoted
          ? null
          : <i className="cap cap-hand-like-2"></i>
        }
        {hasVoted
          ? this.getIntlMessage('vote.cancel')
          : this.getIntlMessage('vote.ok')
        }
      </Button>
    );
  },

});

export default OpinionSourceVoteButton;
