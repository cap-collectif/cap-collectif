import LoginStore from '../../../stores/LoginStore';
import LoginOverlay from '../../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;

const OpinionLinkCreateButton = React.createClass({
  propTypes: {
    handleClick: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <LoginOverlay>
        <Button id="link-form__add" bsStyle="primary" onClick={LoginStore.isLoggedIn() ? this.props.handleClick : null}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('opinion.link.add_new')}
        </Button>
      </LoginOverlay>
    );
  },

});

export default OpinionLinkCreateButton;
