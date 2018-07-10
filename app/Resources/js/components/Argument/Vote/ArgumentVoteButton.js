// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import type { State } from '../../../types';
import LoginOverlay from '../../Utils/LoginOverlay';
import type { ArgumentVoteButton_argument } from './__generated__/ArgumentVoteButton_argument.graphql';

type Props = {
  hasVoted: boolean,
  onClick: () => void,
  argument: ArgumentVoteButton_argument,
  user?: Object,
};

class ArgumentVoteButton extends React.Component<Props> {
  isTheUserTheAuthor = () => {
    const { argument, user } = this.props;
    if (argument.author === null || !user) {
      return false;
    }
    return user.uniqueId === argument.author.slug;
  };

  render() {
    const { hasVoted, onClick, argument } = this.props;
    return (
      <LoginOverlay>
        <Button
          disabled={!argument.contribuable || this.isTheUserTheAuthor()}
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

const container = connect(mapStateToProps)(ArgumentVoteButton);

export default createFragmentContainer(
  container,
  graphql`
    fragment ArgumentVoteButton_argument on Argument
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      author {
        slug
      }
      contribuable
      viewerHasVote @include(if: $isAuthenticated)
    }
  `,
);
