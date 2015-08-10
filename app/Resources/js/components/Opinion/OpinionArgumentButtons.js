import ArgumentActions from '../../actions/ArgumentActions';
import LoginStore from '../../stores/LoginStore';
import LoginOverlay from '../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;
const OverlayTrigger = ReactBootstrap.OverlayTrigger;

const OpinionArgumentButtons = React.createClass({
  propTypes: {
    argument: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      hasInitiallyVoted: this.props.argument.has_user_voted,
      hasVoted: false,
    };
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
    return LoginStore.user.unique_id === this.props.argument.author.unique_id;
  },

  renderVoteButton() {
    if (this.state.hasInitiallyVoted || this.state.hasVoted) {
     return (
        <Button bsStyle="danger" className="btn--outline btn-xs" onClick={!LoginStore.isLoggedIn() ? null : this.deleteVote.bind(null, this)}>
          { this.getIntlMessage('vote.cancel') }
        </Button>
      );
    }
    return (
      <Button bsStyle="success" className="btn--outline btn-xs" onClick={!LoginStore.isLoggedIn() ? null : this.vote.bind(null, this)}>
        <i className="cap-hand-like-2"></i> { this.getIntlMessage('vote.ok') }
      </Button>
    );
  },

  render() {
    const argument = this.props.argument;
    return (
      <div>
        <form style={{display: 'inline-block'}}>
          <LoginOverlay children={ this.renderVoteButton() } />
        </form>
        { ' ' }
        <span className="opinion__votes-nb">
          {(argument.votes_count ? argument.votes_count : 0) + (this.state.hasVoted ? 1 : 0)}
        </span>
        {(this.props.isReportingEnabled === true && !this.isTheUserTheAuthor()
          ? <a href={argument._links.report} className="btn btn-xs btn-dark-gray btn--outline" tabindex="0" data-original-title="" title=""><i className="cap cap-flag-1"></i> Signaler</a>
          : <span />
        )}
      </div>
    );
  },

});

export default OpinionArgumentButtons;
