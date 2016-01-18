import React from 'react';
import {Button} from 'react-bootstrap';
import {IntlMixin} from 'react-intl';

import SourceActions from '../../actions/SourceActions';
import LoginStore from '../../stores/LoginStore';
import LoginOverlay from '../Utils/LoginOverlay';
import OpinionSourceReportButton from './OpinionSourceReportButton';

const OpinionSourceButtons = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      hasVoted: this.props.source.has_user_voted,
    };
  },

  hasVotedSince() {
    return this.state.hasVoted && !this.props.source.has_user_voted;
  },

  vote() {
    this.setState({hasVoted: true});
    SourceActions.addVote(this.props.source.id);
  },

  deleteVote() {
    this.setState({hasVoted: false});
    SourceActions.deleteVote(this.props.source.id);
  },

  isTheUserTheAuthor() {
    if (this.props.source.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.source.author.uniqueId;
  },

  renderVoteButton() {
    if (this.state.hasVoted) {
      return (
        <Button
          disabled={!this.props.source.isContribuable}
          className="source__btn--vote"
          bsStyle="danger"
          bsSize="xsmall"
          onClick={!LoginStore.isLoggedIn() ? null : this.deleteVote.bind(null, this)}
        >
          { this.getIntlMessage('vote.cancel') }
        </Button>
      );
    }
    return (
      <Button
        disabled={!this.props.source.isContribuable}
        bsStyle="success"
        bsSize="xsmall"
        className="source__btn--vote btn--outline"
        onClick={!LoginStore.isLoggedIn() ? null : this.vote.bind(null, this)}
      >
        <i className="cap-hand-like-2"></i> { this.getIntlMessage('vote.ok') }
      </Button>
    );
  },

  renderEditButton() {
    if (this.isTheUserTheAuthor() && this.props.source.isContribuable) {
      return (
        <Button href={this.props.source._links.edit} bsSize="xsmall" className="source__btn--edit btn-dark-gray btn--outline">
          <i className="cap cap-pencil-1"></i>
          {this.getIntlMessage('global.edit')}
        </Button>
      );
    }
    return null;
  },

  render() {
    const source = this.props.source;
    return (
      <div>
        <form style={{display: 'inline-block'}}>
          <LoginOverlay children={ this.renderVoteButton() } />
        </form>
        { ' ' }
        <span className="opinion__votes-nb">
          { source.votes_count + (this.hasVotedSince() ? 1 : 0)}
        </span>
        { ' ' }
        <OpinionSourceReportButton source={source} />
        { this.renderEditButton() }
      </div>
    );
  },

});

export default OpinionSourceButtons;
