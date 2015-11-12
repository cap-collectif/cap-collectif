import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import ProposalActions from '../../../actions/ProposalActions';
import FlashMessages from '../../Utils/FlashMessages';

const Input = ReactBootstrap.Input;

const ProposalVoteAnonymousForm = React.createClass({
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
        name: '',
        email: '',
        body: '',
        private: false,
      },
      errors: {
        name: [],
        email: [],
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
    name: {
      min: {value: 2, message: 'proposal.vote.constraints.title'},
      notBlank: {message: 'proposal.constraints.title'},
    },
    email: {
      min: {value: 2, message: 'proposal.vote.constraints.email'},
      notBlank: {message: 'proposal.constraints.email'},
    },
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
          type="text"
          valueLink={this.linkState('form.name')}
          ref="name"
          label={this.getIntlMessage('proposal.name')}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('name')}
          help={this.renderFormErrors('name')}
          bsStyle={this.getFieldStyle('name')}
        />

        <Input
          type="text"
          valueLink={this.linkState('form.email')}
          ref="email"
          label={this.getIntlMessage('proposal.email')}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('email')}
          help={this.renderFormErrors('email')}
          bsStyle={this.getFieldStyle('email')}
        />

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

export default ProposalVoteAnonymousForm;
