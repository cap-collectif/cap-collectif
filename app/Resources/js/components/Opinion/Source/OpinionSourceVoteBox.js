// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button } from 'react-bootstrap';
import SourceActions from '../../../actions/SourceActions';
import OpinionSourceVoteButton from './OpinionSourceVoteButton';
import type { OpinionSourceVoteBox_source } from './__generated__/OpinionSourceVoteBox_source.graphql';

type Props = {
  source: OpinionSourceVoteBox_source,
};

type State = {
  hasVoted: boolean,
};

class OpinionSourceVoteBox extends React.Component<Props, State> {
  state = {
    hasVoted: false,
  };

  vote = () => {
    const { source } = this.props;
    this.setState({ hasVoted: true });
    SourceActions.addVote(source.id);
  };

  deleteVote = () => {
    const { source } = this.props;
    this.setState({ hasVoted: false });
    SourceActions.deleteVote(source.id);
  };

  render() {
    const { source } = this.props;
    const { hasVoted } = this.state;
    return (
      <span>
        <form style={{ display: 'inline-block' }}>
          {/* $FlowFixMe */}
          <OpinionSourceVoteButton
            source={source}
            disabled={!source.contribuable || source.author.isViewer}
            hasVoted={source.viewerHasVote || hasVoted}
            onClick={source.viewerHasVote || hasVoted ? this.deleteVote : this.vote}
          />
        </form>
        <Button className="btn--outline btn-dark-gray btn-xs opinion__votes-nb">
          {source.votesCount + (hasVoted ? 1 : 0)}
        </Button>
      </span>
    );
  }
}

export default createFragmentContainer(
  OpinionSourceVoteBox,
  graphql`
    fragment OpinionSourceVoteBox_source on Source
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      author {
        id
        slug
        isViewer @include(if: $isAuthenticated)
      }
      contribuable
      votesCount
      viewerHasVote @include(if: $isAuthenticated)
      ...OpinionSourceVoteButton_source @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
);
