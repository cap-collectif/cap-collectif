// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import LoginOverlay from '../../Utils/LoginOverlay';
import type { GlobalState } from '../../../types';

type Props = {
  disabled: boolean,
  hasVoted: boolean,
  onClick: Function,
  user?: Object,
  features: Object,
};

class OpinionSourceVoteButton extends React.Component<Props> {
  static defaultProps = {
    user: null,
  };

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
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => {
  return {
    user: state.user.user,
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(OpinionSourceVoteButton);
