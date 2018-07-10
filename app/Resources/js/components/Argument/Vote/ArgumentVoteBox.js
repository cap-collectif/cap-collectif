// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ArgumentActions from '../../../actions/ArgumentActions';
import ArgumentVoteButton from './ArgumentVoteButton';
import type { ArgumentVoteBox_argument } from './__generated__/ArgumentVoteBox_argument.graphql';

type Props = {
  argument: ArgumentVoteBox_argument,
};

type State = {
  hasVoted: boolean,
};

class ArgumentVoteBox extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { argument } = props;

    this.state = {
      hasVoted: !!argument.viewerHasVote,
    };
  }

  vote = () => {
    const { argument } = this.props;
    this.setState({ hasVoted: true });
    ArgumentActions.addVote(argument.id);
  };

  deleteVote = () => {
    const { argument } = this.props;
    this.setState({ hasVoted: false });
    ArgumentActions.deleteVote(argument.id);
  };

  render() {
    const { hasVoted } = this.state;
    const { argument } = this.props;
    const hasVotedSince = hasVoted && !argument.viewerHasVote;
    const hasUnVotedSince = !hasVoted && argument.viewerHasVote;
    const showVoted = hasVoted || hasVotedSince;
    return (
      <span>
        <form style={{ display: 'inline-block' }}>
          <ArgumentVoteButton
            argument={argument}
            hasVoted={showVoted}
            onClick={showVoted ? this.deleteVote : this.vote}
          />
        </form>{' '}
        <span className="opinion__votes-nb">
          {argument.votesCount + (hasVotedSince ? 1 : 0) + (hasUnVotedSince ? -1 : 0)}
        </span>
      </span>
    );
  }
}

export default createFragmentContainer(
  ArgumentVoteBox,
  graphql`
    fragment ArgumentVoteBox_argument on Argument
      @argumentDefinitions(isAuthenticated: { type: "Boolean", defaultValue: true }) {
      id
      votesCount
      viewerHasVote @include(if: $isAuthenticated)
      ...ArgumentVoteButton_argument @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
);
