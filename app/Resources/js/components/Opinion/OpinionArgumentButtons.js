import ArgumentActions from '../../actions/ArgumentActions';
import LoginStore from '../../stores/LoginStore';
import LoginOverlay from '../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;

const OpinionArgumentButtons = React.createClass({
  propTypes: {
    argument: React.PropTypes.object.isRequired,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      hasVoted: this.props.argument.has_user_voted,
    };
  },

  getVoteCount() {
    let diff = 0;
    if (this.state.hasVoted !== this.props.argument.has_user_voted) {
      diff = this.props.argument.has_user_voted ? -1 : 1;
    }
    return this.props.argument.votes_count + diff < 0 ? 0 : this.props.argument.votes_count + diff;
  },

  renderVoteButton() {
    if (this.state.hasVoted) {
      return (
        <Button aria-labelledby={'arg-' + this.props.argument.id} disabled={!this.props.argument.isContribuable} className="argument__btn--vote" bsStyle="danger" bsSize="xsmall"
                onClick={!LoginStore.isLoggedIn() ? null : this.deleteVote.bind(null, this)}>
          { this.getIntlMessage('vote.cancel') }
        </Button>
      );
    }
    return (
      <Button aria-labelledby={'arg-' + this.props.argument.id} disabled={!this.props.argument.isContribuable} bsStyle="success" bsSize="xsmall" className="argument__btn--vote btn--outline"
              onClick={!LoginStore.isLoggedIn() ? null : this.vote.bind(null, this)}>
        <i className="cap-hand-like-2"></i> { this.getIntlMessage('vote.ok') }
      </Button>
    );
  },

  renderReportButton() {
    if (this.props.isReportingEnabled && !this.isTheUserTheAuthor()) {
      const reported = this.props.argument.has_user_reported;
      return (
        <LoginOverlay children={
          <Button
            aria-labelledby={'arg-' + this.props.argument.id}
            href={reported ? null : this.props.argument._links.report}
            bsSize="xsmall"
            active={reported}
            className="btn-dark-gray btn--outline"
          >
            <i className="cap cap-flag-1"></i>
            {reported ? this.getIntlMessage('global.report.reported') : this.getIntlMessage('global.report.submit')}
          </Button>
        } />
      );
    }
  },

  renderEditButton() {
    if (this.props.argument.isContribuable && this.isTheUserTheAuthor()) {
      return (
        <Button aria-labelledby={'arg-' + this.props.argument.id} href={this.props.argument._links.edit} bsSize="xsmall" className="argument__btn--edit btn-dark-gray btn--outline">
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
        { this.renderReportButton() }
        { this.renderEditButton() }
      </div>
    );
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


});

export default OpinionArgumentButtons;
