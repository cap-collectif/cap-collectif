import React from 'react';
import ArgumentActions from '../../../actions/ArgumentActions';
import ArgumentVoteButton from './ArgumentVoteButton';

const ArgumentVoteBox = React.createClass({
  propTypes: {
    argument: React.PropTypes.object.isRequired,
  },

  getInitialState() {
    const { argument } = this.props;
    return {
      hasVoted: argument.hasUserVoted,
    };
  },

  vote() {
    const { argument } = this.props;
    this.setState({ hasVoted: true });
    ArgumentActions.addVote(argument.id);
  },

  deleteVote() {
    const { argument } = this.props;
    this.setState({ hasVoted: false });
    ArgumentActions.deleteVote(argument.id);
  },

  render() {
    const { hasVoted } = this.state;
    const { argument } = this.props;
    const hasVotedSince = hasVoted && !argument.hasUserVoted;
    const hasUnVotedSince = !hasVoted && argument.hasUserVoted;
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
  },
});

export default ArgumentVoteBox;
