import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import ArgumentActions from '../../../actions/ArgumentActions';
import ArgumentVoteButton from './ArgumentVoteButton';

const ArgumentVoteBox = React.createClass({
  propTypes: {
    argument: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      hasVoted: this.props.argument.hasUserVoted,
    };
  },

  vote() {
    this.setState({ hasVoted: true });
    ArgumentActions.addVote(this.props.argument.id);
  },

  deleteVote() {
    this.setState({ hasVoted: false });
    ArgumentActions.deleteVote(this.props.argument.id);
  },

  isTheUserTheAuthor() {
    if (this.props.argument.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.argument.author.uniqueId;
  },

  render() {
    const { hasVoted } = this.state;
    const { argument } = this.props;
    const hasVotedSince = (hasVoted && !argument.hasUserVoted);
    const hasUnVotedSince = (!hasVoted && argument.hasUserVoted);
    const showVoted = hasVoted || hasVotedSince;
    return (
      <span>
        <form style={{ display: 'inline-block' }}>
          <ArgumentVoteButton
            disabled={!argument.isContribuable || this.isTheUserTheAuthor()}
            hasVoted={showVoted}
            onClick={showVoted ? this.deleteVote : this.vote}
          />
        </form>
        { ' ' }
        <span className="opinion__votes-nb">
          { argument.votesCount + (hasVotedSince ? 1 : 0) + (hasUnVotedSince ? -1 : 0)}
        </span>
      </span>
    );
  },

});

export default ArgumentVoteBox;
