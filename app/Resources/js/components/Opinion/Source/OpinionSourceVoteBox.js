// @flow
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import SourceActions from '../../../actions/SourceActions';
import OpinionSourceVoteButton from './OpinionSourceVoteButton';

const OpinionSourceVoteBox = React.createClass({
  propTypes: {
    source: PropTypes.object.isRequired,
    user: PropTypes.object,
  },

  getDefaultProps() {
    return {
      user: null,
    };
  },

  getInitialState() {
    const { source } = this.props;
    return {
      hasVoted: source.hasUserVoted,
    };
  },

  vote() {
    const { source } = this.props;
    this.setState({ hasVoted: true });
    SourceActions.addVote(source.id);
  },

  deleteVote() {
    const { source } = this.props;
    this.setState({ hasVoted: false });
    SourceActions.deleteVote(source.id);
  },

  isTheUserTheAuthor() {
    const { source, user } = this.props;
    if (source.author === null || !user) {
      return false;
    }
    return user.uniqueId === source.author.uniqueId;
  },

  render() {
    const { hasVoted } = this.state;
    const { source } = this.props;
    const hasVotedSince = hasVoted && !source.hasUserVoted;
    const hasUnVotedSince = !hasVoted && source.hasUserVoted;
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
  },
});

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(OpinionSourceVoteBox);
