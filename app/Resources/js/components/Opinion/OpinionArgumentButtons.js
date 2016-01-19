import React from 'react';
import {Button} from 'react-bootstrap';
import {IntlMixin} from 'react-intl';
import ArgumentActions from '../../actions/ArgumentActions';
import LoginStore from '../../stores/LoginStore';
import LoginOverlay from '../Utils/LoginOverlay';
import ShareButtonDropdown from '../Utils/ShareButtonDropdown';
import OpinionArgumentReportButton from './OpinionArgumentReportButton';

const OpinionArgumentButtons = React.createClass({
  propTypes: {
    argument: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      hasVoted: this.props.argument.has_user_voted,
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({
      hasVoted: nextProps.argument.has_user_voted,
    });
  },

  getVoteCount() {
    const count = this.props.argument.votes_count;
    return this.state.hasVoted !== this.props.argument.has_user_voted ? count + 1 : count;
  },

  vote() {
    this.setState({hasVoted: true});
    ArgumentActions.addVote(this.props.argument.id);
  },

  deleteVote() {
    this.setState({hasVoted: false});
    ArgumentActions.deleteVote(this.props.argument.id);
  },

  isTheUserTheAuthor() {
    if (this.props.argument.author === null || !LoginStore.isLoggedIn()) {
      return false;
    }
    return LoginStore.user.uniqueId === this.props.argument.author.uniqueId;
  },

  renderVoteButton() {
    if (this.state.hasVoted) {
      return (
        <Button
          aria-labelledby={'arg-' + this.props.argument.id}
          disabled={!this.props.argument.isContribuable}
          className="argument__btn--vote"
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
        aria-labelledby={'arg-' + this.props.argument.id}
        disabled={!this.props.argument.isContribuable}
        bsStyle="success"
        bsSize="xsmall"
        className="argument__btn--vote btn--outline"
        onClick={!LoginStore.isLoggedIn() ? null : this.vote.bind(null, this)}
      >
        <i className="cap-hand-like-2"></i> { this.getIntlMessage('vote.ok') }
      </Button>
    );
  },

  renderEditButton() {
    if (this.props.argument.isContribuable && this.isTheUserTheAuthor()) {
      return (
        <Button
          aria-labelledby={'arg-' + this.props.argument.id}
          href={this.props.argument._links.edit}
          bsSize="xsmall"
          className="argument__btn--edit btn-dark-gray btn--outline"
        >
          <i className="cap cap-pencil-1"></i>
          {this.getIntlMessage('global.edit')}
        </Button>
      );
    }
  },

  render() {
    return (
      <div>
        <form style={{display: 'inline-block'}}>
          <LoginOverlay children={ this.renderVoteButton() } />
        </form>
        { ' ' }
        <span className="opinion__votes-nb">
          {this.getVoteCount()}
        </span>
        { ' ' }
        <OpinionArgumentReportButton argument={this.props.argument} />
        { this.renderEditButton() }
        <ShareButtonDropdown
          url={this.props.argument._links.show}
          className="btn-xs btn--outline"
        />
      </div>
    );
  },

});

export default OpinionArgumentButtons;
