import OpinionActions from '../../actions/OpinionActions';
import LoginOverlay from '../Utils/LoginOverlay';
import LoginStore from '../../stores/LoginStore';

const ButtonToolbar = ReactBootstrap.ButtonToolbar;
const Button = ReactBootstrap.Button;
const MenuItem = ReactBootstrap.MenuItem;
const DropdownButton = ReactBootstrap.DropdownButton;

const OpinionButtons = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    opinionId: React.PropTypes.number.isRequired,
    versionId: React.PropTypes.number.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      hasInitiallyVoted: this.props.opinion.user_vote,
      hasVoted: null,
    };
  },

  renderVoteButton(type) {
    if (type === 'ok') {
      return (
        <Button bsStyle="success" className="btn--outline"
                onClick={this.voteAction.bind(this, 1)}
                active={this.isCurrentVote(1)}
        >
          <i className="cap cap-hand-like-2-1"></i>
          { ' ' + this.getIntlMessage('vote.ok') }
        </Button>
      );
    }
    if (type === 'mitige') {
      return (
        <Button bsStyle="warning" className="btn--outline"
                onClick={this.voteAction.bind(this, 0)}
                active={this.isCurrentVote(0)}
        >
          <i className="cap cap-hand-like-2 icon-rotate"></i>
          { ' ' + this.getIntlMessage('vote.mitige') }
        </Button>
      );
    }
    if (type === 'nok') {
      return (
        <Button bsStyle="danger" className="btn--outline"
                onClick={this.voteAction.bind(this, -1)}
                active={this.isCurrentVote(-1)}
        >
          <i className="cap cap-hand-unlike-2-1"></i>
          { ' ' + this.getIntlMessage('vote.nok') }
        </Button>
      );
    }
  },

  render() {
    const reported = this.props.opinion.has_user_reported;
    return (
      <ButtonToolbar>
        <LoginOverlay children={ this.renderVoteButton('ok') } />
        <LoginOverlay children={ this.renderVoteButton('mitige') } />
        <LoginOverlay children={ this.renderVoteButton('nok') } />
        <Button className="pull-right btn--outline btn-dark-gray" href={reported ? '#' : this.props.opinion._links.report} active={reported}>
          <i className="cap cap-flag-1"></i>
          {' ' + reported ? this.getIntlMessage('global.report.reported') : this.getIntlMessage('global.report.submit') }
        </Button>
        <DropdownButton className="pull-right" title={<span><i className="cap cap-link"></i> Partager</span>}>
          <MenuItem eventKey="1" href="http://www.facebook.com/sharer.php?u=http%20actuelles.">
            <i className="cap cap-facebook"></i> Facebook
          </MenuItem>
          <MenuItem eventKey="2" href="http://twitter.com/share?url=http20actuelles.">
            <i className="cap cap-twitter"></i> Twitter
          </MenuItem>
          <MenuItem eventKey="3" href="https://plus.google.com/share?url=http%3">
            <i className="cap cap-gplus"></i> Google+
          </MenuItem>
          <MenuItem eventKey="4" href="mailto:?subject=La%20l%Cls">
            <i className="cap cap-mail-2-1"></i> Email
          </MenuItem>
          <MenuItem eventKey="5">
            <i className="cap cap-link-1"></i> Lien de partage
          </MenuItem>
        </DropdownButton>
      </ButtonToolbar>
    );
  },

 currentVote() {
    return this.state.hasVoted !== null ? this.state.hasVoted : this.state.hasInitiallyVoted;
  },

  isCurrentVote(value) {
    return value === this.currentVote();
  },

  vote(value) {
    this.setState({hasVoted: value});
    OpinionActions.voteForVersion(this.props.opinionId, this.props.versionId, {value: value});
  },

  deleteVote() {
    this.setState({hasVoted: null, hasInitiallyVoted: null});
    OpinionActions.deleteVoteForVersion(this.props.opinionId, this.props.versionId);
  },

  voteAction(value) {
    if (!LoginStore.isLoggedIn()) {
      return null;
    }
    return this.isCurrentVote(value) ? this.deleteVote() : this.vote(value);
  },

});

export default OpinionButtons;
