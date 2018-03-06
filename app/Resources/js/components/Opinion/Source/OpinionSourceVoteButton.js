// @flow
import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import LoginOverlay from '../../Utils/LoginOverlay';
import type { State } from '../../../types';

const OpinionSourceVoteButton = React.createClass({
  propTypes: {
    disabled: PropTypes.bool.isRequired,
    hasVoted: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    user: PropTypes.object,
    features: PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      user: null
    };
  },

  render() {
    const { disabled, hasVoted, onClick, user, features } = this.props;
    return (
      <LoginOverlay user={user} features={features}>
        <Button
          disabled={disabled}
          bsStyle={hasVoted ? 'danger' : 'success'}
          className={`source__btn--vote${hasVoted ? '' : ' btn--outline'}`}
          bsSize="xsmall"
          onClick={user ? onClick : null}>
          {hasVoted ? (
            <span>{<FormattedMessage id="vote.cancel" />}</span>
          ) : (
            <span>
              <i className="cap cap-hand-like-2" /> {<FormattedMessage id="vote.ok" />}
            </span>
          )}
        </Button>
      </LoginOverlay>
    );
  }
});

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => {
  return {
    user: state.user.user,
    features: state.default.features
  };
};

export default connect(mapStateToProps)(OpinionSourceVoteButton);
