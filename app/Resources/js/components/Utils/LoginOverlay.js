import LoginStore from '../../stores/LoginStore';

const OverlayTrigger = ReactBootstrap.OverlayTrigger;
const Popover = ReactBootstrap.Popover;
const Button = ReactBootstrap.Button;

const LoginOverlay = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  // We add Popover if user is not connected
  render() {
    if (LoginStore.isLoggedIn()) {
      return this.props.children;
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
        { this.props.children }
      </OverlayTrigger>
    );
  },

});

export default LoginOverlay;
