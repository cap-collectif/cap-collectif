// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import type { State } from '../../../types';
import LoginOverlay from '../../Utils/LoginOverlay';

type Props = {
  hasVoted: boolean,
  onClick: Function,
  argument: Object,
  user?: Object,
};

class ArgumentVoteButton extends React.Component<Props> {
  isTheUserTheAuthor = () => {
    const { argument, user } = this.props;
    if (argument.author === null || !user) {
      return false;
    }
    return user.uniqueId === argument.author.uniqueId;
  };

  render() {
    const { hasVoted, onClick, argument } = this.props;
    return (
      <LoginOverlay>
        <Button
          disabled={!argument.isContribuable || this.isTheUserTheAuthor()}
          bsStyle={hasVoted ? 'danger' : 'success'}
          className={`argument__btn--vote${hasVoted ? '' : ' btn--outline'}`}
          bsSize="xsmall"
          onClick={onClick}>
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(ArgumentVoteButton);
