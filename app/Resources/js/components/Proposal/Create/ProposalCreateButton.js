import LoginStore from '../../../stores/LoginStore';
import LoginOverlay from '../../Utils/LoginOverlay';

const Button = ReactBootstrap.Button;

const ProposalCreateButton = React.createClass({
  propTypes: {
    handleClick: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <LoginOverlay>
        <Button id="proposal-form__add" bsStyle="primary" onClick={LoginStore.isLoggedIn() ? this.props.handleClick : null}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('proposal.add')}
        </Button>
      </LoginOverlay>
    );
  },

});

export default ProposalCreateButton;
