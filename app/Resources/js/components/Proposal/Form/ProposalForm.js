import FormMixin from '../../../utils/FormMixin';
import CkeditorMixin from '../../../utils/CkeditorMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import ProposalActions from '../../../actions/ProposalActions';
import FlashMessages from '../../Utils/FlashMessages';

const Input = ReactBootstrap.Input;

const ProposalForm = React.createClass({
  propTypes: {
    form: React.PropTypes.object.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
    onValidationFailure: React.PropTypes.func.isRequired,
    onSubmitSuccess: React.PropTypes.func.isRequired,
    onSubmitFailure: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, DeepLinkStateMixin, FormMixin, CkeditorMixin],

  getInitialState() {
    return {
      form: {
        title: '',
        body: '',
        type: null,
      },
      errors: {
        title: [],
        body: [],
      },
    };
  },

  componentDidMount() {
    this.initializeCkeditor('body', 'form');
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmitting === true) {
      if (this.isValid()) {
        ProposalActions
          .add(this.props.form.id, this.state.form)
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
    type: {
      notNull: {message: 'proposal.link.constraints.type'},
    },
    title: {
      min: {value: 2, message: 'proposal.constraints.title'},
      notBlank: {message: 'proposal.constraints.title'},
    },
    body: {
      min: {value: 2, message: 'proposal.constraints.body'},
      notBlank: {message: 'proposal.constraints.body'},
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
      <form id="proposal-form" ref="form">

        <Input
          type="text"
          valueLink={this.linkState('form.title')}
          ref="title"
          label={this.getIntlMessage('proposal.title')}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('title')}
          help={this.renderFormErrors('title')}
          bsStyle={this.getFieldStyle('title')}
        />

        <Input
          type="textarea"
          valueLink={null} // state is automatically updated by CkeditorMixin
          ref="body"
          label={this.getIntlMessage('proposal.body')}
          labelClassName="control-label h5"
          groupClassName={this.getGroupStyle('body')}
          help={this.renderFormErrors('body')}
          bsStyle={this.getFieldStyle('body')}
        />

      </form>
    );
  },

});

export default ProposalForm;
