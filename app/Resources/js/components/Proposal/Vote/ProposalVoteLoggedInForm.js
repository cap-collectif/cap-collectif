import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import ProposalActions from '../../../actions/ProposalActions';
import FlashMessages from '../../Utils/FlashMessages';

const Input = ReactBootstrap.Input;

const ProposalVoteLoggedInForm = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
    onValidationFailure: React.PropTypes.func.isRequired,
    onSubmitSuccess: React.PropTypes.func.isRequired,
    onSubmitFailure: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, DeepLinkStateMixin, FormMixin],

  getInitialState() {
    return {
      form: {
        body: '',
        private: false,
      },
      errors: {
        body: [],
        private: [],
      },
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmitting === true) {
      if (this.isValid()) {
        ProposalActions
          .vote(this.props.proposal.id, this.state.form)
          .then(() => {
            this.setState(this.getInitialState());
            this.props.onSubmitSuccess();
          })
          .catch(() => {
            this.props.onSubmitFailure();
          });
        return;
      }

      this.props.onValidationFailure();
    }
  },

  formValidationRules: {
    body: {
      min: {value: 2, message: 'proposal.vote.constraints.body'},
      notBlank: {message: 'proposal.vote.constraints.body'},
    },
  },

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
      return null;
    }
    return <FlashMessages errors={errors} form />;
  },

  render() {
    return (
      <form ref="form">

        <Input
          type="textarea"
          valueLink={'form.body'}
          ref="body"
          label={this.getIntlMessage('proposal.body')}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('body')}
          help={this.renderFormErrors('body')}
          bsStyle={this.getFieldStyle('body')}
        />

        <Input
          type="checkbox"
          valueLink={'form.private'}
          ref="private"
          label={this.getIntlMessage('proposal.private')}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('private')}
          help={this.renderFormErrors('private')}
          bsStyle={this.getFieldStyle('private')}
        />

      </form>
    );
  },

});

export default ProposalVoteLoggedInForm;
