import LoginStore from '../../../stores/LoginStore';
import LoginOverlay from '../../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;

const ProposalCreateButton = React.createClass({
  propTypes: {
    handleClick: React.PropTypes.func.isRequired,
    disabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  onClick() {
    if (!this.props.disabled && LoginStore.isLoggedIn()) {
      this.props.handleClick();
    }
  },

  render() {
    return (
      <LoginOverlay>
        <Button bsStyle="primary" onClick={() => this.onClick()}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('proposal.add')}
        </Button>
      </LoginOverlay>
    );
  },

});

export default ProposalCreateButton;
