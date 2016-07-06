import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import SourceActions from '../../../actions/SourceActions';
import OpinionSourceVoteButton from './OpinionSourceVoteButton';
import { connect } from 'react-redux';

const OpinionSourceVoteBox = React.createClass({
  propTypes: {
    source: PropTypes.object.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  getInitialState() {
    return {
      hasVoted: this.props.source.has_user_voted,
    };
  },

  vote() {
    this.setState({ hasVoted: true });
    SourceActions.addVote(this.props.source.id);
  },

  deleteVote() {
    this.setState({ hasVoted: false });
    SourceActions.deleteVote(this.props.source.id);
  },

  isTheUserTheAuthor() {
    if (this.props.source.author === null || !this.props.user) {
      return false;
    }
    return this.props.user.uniqueId === this.props.source.author.uniqueId;
  },

  render() {
    const { hasVoted } = this.state;
    const { source } = this.props;
    const hasVotedSince = (hasVoted && !source.has_user_voted);
    const hasUnVotedSince = (!hasVoted && source.has_user_voted);
    const showVoted = hasVoted || hasVotedSince;
    return (
      <span>
        <form style={{ display: 'inline-block' }}>
          <OpinionSourceVoteButton
            disabled={!source.isContribuable || this.isTheUserTheAuthor()}
            hasVoted={showVoted}
            onClick={showVoted ? this.deleteVote : this.vote}
          />
        </form>
        { ' ' }
        <span className="opinion__votes-nb">
          { source.votes_count + (hasVotedSince ? 1 : 0) + (hasUnVotedSince ? -1 : 0)}
        </span>
      </span>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(OpinionSourceVoteBox);
