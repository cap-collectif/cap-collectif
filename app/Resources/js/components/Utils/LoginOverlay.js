import LoginStore from '../../stores/LoginStore';

const OverlayTrigger = ReactBootstrap.OverlayTrigger;
const Popover = ReactBootstrap.Popover;
const Button = ReactBootstrap.Button;

const LoginOverlay = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    isRegistrationEnabled: React.PropTypes.boolean,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      isRegistrationEnabled: true,
    };
  },

  // We add Popover if user is not connected
  render() {
    if (LoginStore.isLoggedIn()) {
      return this.props.children;
    }

    return (
      <OverlayTrigger rootClose trigger="click" placement="top" overlay={
          <Popover title={this.getIntlMessage('vote.popover.title')}>
            <p>
              { this.getIntlMessage('vote.popover.body') }
            </p>
            {(this.props.isRegistrationEnabled
              ? <p>
                  <Button href="/render" bsStyle="success" className="center-block">
                    { this.getIntlMessage('vote.popover.signin') }
                  </Button>
                </p>
              : <span />
            )}
            <p>
              <Button href="/login" bsStyle="success" className="center-block">
                { this.getIntlMessage('vote.popover.login') }
              </Button>
            </p>
          </Popover>}
      >
        { this.props.children }
      </OverlayTrigger>
    );
  },

});

export default LoginOverlay;
