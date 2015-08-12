import SourceActions from '../../actions/SourceActions';
import LoginStore from '../../stores/LoginStore';
import LoginOverlay from '../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;

const OpinionSourceButtons = React.createClass({
  propTypes: {
    source: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      hasInitiallyVoted: this.props.source.has_user_voted,
      hasVoted: false,
    };
  },

  renderVoteButton() {
    if (this.state.hasInitiallyVoted || this.state.hasVoted) {
      return (
        <Button bsStyle="danger" bsSize="xsmall" className="btn--outline" onClick={!LoginStore.isLoggedIn() ? null : this.deleteVote.bind(null, this)}>
          { this.getIntlMessage('vote.cancel') }
        </Button>
      );
    }
    return (
      <Button bsStyle="success" bsSize="xsmall" className="btn--outline" onClick={!LoginStore.isLoggedIn() ? null : this.vote.bind(null, this)}>
        <i className="cap-hand-like-2"></i> { this.getIntlMessage('vote.ok') }
      </Button>
    );
  },

 renderReportButton() {
    if (!this.isTheUserTheAuthor()) {
      if (this.props.source.has_user_reported) {
        return (
          <Button bsSize="xsmall" className="btn-dark-gray active">
            <i className="cap cap-flag-1"></i>
            {this.getIntlMessage('global.report.reported')}
          </Button>
        );
      }
      return (
        <Button href={this.props.source._links.report} bsSize="xsmall" className="btn-dark-gray btn--outline">
          <i className="cap cap-flag-1"></i>
          {this.getIntlMessage('global.report.submit')}
        </Button>
      );
    }
    return <span />;
  },

  renderEditButton() {
    if (this.isTheUserTheAuthor()) {
      return (
        <Button href={this.props.source._links.edit} bsSize="xsmall" className="btn-dark-gray btn--outline">
          <i className="cap cap-pencil-1"></i>
          {this.getIntlMessage('global.edit')}
        </Button>
      );
    }
    return <span />;
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
          { source.votes_count + (this.state.hasVoted ? 1 : 0)}
        </span>
        { ' ' }
        <LoginOverlay children={ this.renderReportButton() } />
        { this.renderEditButton() }
      </div>
    );
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
    return LoginStore.user.unique_id === this.props.source.author.unique_id;
  },

});

export default OpinionSourceButtons;
