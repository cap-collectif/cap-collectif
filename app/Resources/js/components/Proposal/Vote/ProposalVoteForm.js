import ProposalVoteAnonymousForm from './ProposalVoteAnonymousForm';
import ProposalVoteLoggenInForm from './ProposalVoteLoggenInForm';
import LogginStore from '../../stores/LogginStore';

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
    if (LogginStore.isLoggedIn()) {
      return <ProposalVoteLoggenInForm {...this.props} />;
    }
    return <ProposalVoteAnonymousForm {...this.props} />;
  },

});

export default ProposalVoteForm;
