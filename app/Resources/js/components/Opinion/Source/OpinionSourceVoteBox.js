// @flow
import React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import SourceActions from '../../../actions/SourceActions';
import OpinionSourceVoteButton from './OpinionSourceVoteButton';
import type { GlobalState } from '../../../types';

type Props = {
  source: Object,
  user?: Object,
};

type State = {
  hasVoted: boolean,
};

class OpinionSourceVoteBox extends React.Component<Props, State> {
  static defaultProps = {
    user: null,
  };

  constructor(props) {
    super(props);
    const { source } = props;

    this.state = {
      hasVoted: source.viewerHasVote,
    };
  }

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

  isTheUserTheAuthor = () => {
    const { source, user } = this.props;
    if (source.author === null || !user) {
      return false;
    }
    return user.uniqueId === source.author.uniqueId;
  };

  render() {
    const { hasVoted } = this.state;
    const { source } = this.props;
    const hasVotedSince = hasVoted && !source.viewerHasVote;
    const hasUnVotedSince = !hasVoted && source.viewerHasVote;
    const showVoted = hasVoted || hasVotedSince;
    return (
      <span>
        <form style={{ display: 'inline-block' }}>
          <OpinionSourceVoteButton
            disabled={!source.isContribuable || this.isTheUserTheAuthor()}
            hasVoted={showVoted}
            onClick={showVoted ? this.deleteVote : this.vote}
          />
        </form>{' '}
        <span className="opinion__votes-nb">
          {source.votesCount + (hasVotedSince ? 1 : 0) + (hasUnVotedSince ? -1 : 0)}
        </span>
      </span>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(OpinionSourceVoteBox);
