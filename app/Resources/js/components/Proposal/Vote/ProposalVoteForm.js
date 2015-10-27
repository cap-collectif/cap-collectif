import ProposalVoteAnonymousForm from './ProposalVoteAnonymousForm';
import ProposalVoteLoggedInForm from './ProposalVoteLoggedInForm';
import LoginStore from '../../../stores/LoginStore';

const ProposalVoteForm = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
    onValidationFailure: React.PropTypes.func.isRequired,
    onSubmitSuccess: React.PropTypes.func.isRequired,
    onSubmitFailure: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (LoginStore.isLoggedIn()) {
      return <ProposalVoteLoggedInForm {...this.props} />;
    }
    return <ProposalVoteAnonymousForm {...this.props} />;
  },

});

export default ProposalVoteForm;
