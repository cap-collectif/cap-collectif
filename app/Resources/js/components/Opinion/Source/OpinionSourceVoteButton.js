import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import LoginOverlay from '../../Utils/LoginOverlay';

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
      <LoginOverlay>
        <Button
          disabled={disabled}
          bsStyle={hasVoted ? 'danger' : 'success'}
          className={'source__btn--vote' + (hasVoted ? '' : ' btn--outline')}
          bsSize="xsmall"
          onClick={LoginStore.isLoggedIn() ? onClick : null}
        >
          {hasVoted
            ? <span>{this.getIntlMessage('vote.cancel')}</span>
            : <span>
                <i className="cap cap-hand-like-2"></i>
                {' '}
                {this.getIntlMessage('vote.ok')}
            </span>
          }
        </Button>
      </LoginOverlay>
    );
  },

});

export default OpinionSourceVoteButton;
