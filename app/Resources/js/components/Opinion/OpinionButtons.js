import OpinionActions from '../../actions/OpinionActions';
import LoginStore from '../../stores/LoginStore';

const ButtonToolbar = ReactBootstrap.ButtonToolbar;
const Button = ReactBootstrap.Button;
const OverlayTrigger = ReactBootstrap.OverlayTrigger;
const Popover = ReactBootstrap.Popover;
const MenuItem = ReactBootstrap.MenuItem;
const DropdownButton = ReactBootstrap.DropdownButton;

const OpinionButtons = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      vote: this.props.opinion.user_vote,
    };
  },

  vote(value) {
    this.setState({vote: value});
    OpinionActions.voteForVersion(this.props.opinionId, this.props.versionId, {value: value});
  },

  renderVoteButton(type, enable) {
    if (type === 'ok') {
      return (
        <Button bsStyle='success' className="btn--outline"
                onClick={enable ? this.vote.bind(this, 1) : null}
                active={this.state.vote === 1 ? true : false}
        >
          <i className="cap cap-hand-like-2-1"></i>
          { ' ' + this.getIntlMessage('vote.ok') }
        </Button>
      );
    }
    if (type === 'mitige') {
      return (
        <Button bsStyle='warning' className="btn--outline"
                onClick={enable ? this.vote.bind(this, 0) : null}
                active={this.state.vote === 0 ? true : false}
        >
          <i className="cap cap-hand-like-2 icon-rotate"></i>
          { ' ' + this.getIntlMessage('vote.mitige') }
        </Button>
      );
    }
    if (type === 'nok') {
      return (
        <Button bsStyle='danger' className="btn--outline"
                onClick={enable ? this.vote.bind(this, -1) : null}
                active={this.state.vote === -1 ? true : false}
        >
          <i className="cap cap-hand-unlike-2-1"></i>
          { ' ' + this.getIntlMessage('vote.nok') }
        </Button>
      );
    }
  },

  // We add Popover if user is not connected
  renderButton(type) {
    if (LoginStore.isLoggedIn()) {
      return this.renderVoteButton(type, true);
    }

    return (
      <OverlayTrigger rootClose trigger='click' placement='top' overlay={
          <Popover title={this.getIntlMessage('vote.popover.title')}>
            <p>
              { this.getIntlMessage('vote.popover.body') }
            </p>
            {this.props.isRegistrationEnabled
              ? <p><a href='/register' className='btn btn-success center-block'>{ this.getIntlMessage('vote.popover.signin') }</a></p>
              : <span />
            }
            <p>
              <Button href='/login' bsStyle='success' className="center-block">{ this.getIntlMessage('vote.popover.login') }</Button>
            </p>
          </Popover>}
      >
        { this.renderVoteButton(type, false) }
      </OverlayTrigger>
    );
  },

/*
        <DropdownButton title={<span><i className="cap cap-link"></i> Partager</span>}>

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

*/

  render() {
    return (
      <ButtonToolbar>
        { this.renderButton('ok') }
        { this.renderButton('mitige') }
        { this.renderButton('nok') }
        <Button className="pull-right" href={this.props.opinion._links.report}>
          <i className="cap cap-flag-1"></i> Signaler
        </Button>
      </ButtonToolbar>
    );
  },

});

export default OpinionButtons;
