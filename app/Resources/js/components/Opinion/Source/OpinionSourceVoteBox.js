import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';
import SourceActions from '../../../actions/SourceActions';
import OpinionSourceVoteButton from './OpinionSourceVoteButton';

const OpinionSourceVoteBox = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

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

  render() {
    const { hasVoted } = this.state;
    const { source } = this.props;
    const hasVotedSince = (hasVoted && !source.has_user_voted);
    const hasUnVotedSince = (!hasVoted && source.has_user_voted);
    const showVoted = hasVoted || hasVotedSince;
    return (
      <span>
        <form style={{ display: 'inline-block' }}>
          <LoginOverlay>
            <OpinionSourceVoteButton
              disabled={!source.isContribuable}
              hasVoted={showVoted}
              onClick={showVoted ? this.deleteVote : this.vote}
            />
          </LoginOverlay>
        </form>
        { ' ' }
        <span className="opinion__votes-nb">
          { source.votes_count + (hasVotedSince ? 1 : 0) + (hasUnVotedSince ? -1 : 0)}
        </span>
      </span>
    );
  },

});

export default OpinionSourceVoteBox;
