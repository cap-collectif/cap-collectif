import FormMixin from '../../../utils/FormMixin';
import CkeditorMixin from '../../../utils/CkeditorMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import OpinionLinkActions from '../../../actions/OpinionLinkActions';
import FlashMessages from '../../Utils/FlashMessages';
import Input from '../../Form/Input';

const OpinionLinkForm = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    availableTypes: React.PropTypes.array.isRequired,
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
        link: this.props.opinion.id,
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
        const step = this.props.opinion.step;
        OpinionLinkActions
          .add(step.projectId, step.id, this.state.form)
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
      notNull: {message: 'opinion.link.constraints.type'},
    },
    title: {
      min: {value: 2, message: 'opinion.constraints.title'},
      notBlank: {message: 'opinion.constraints.title'},
    },
    body: {
      min: {value: 2, message: 'opinion.constraints.body'},
      notBlank: {message: 'opinion.constraints.body'},
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
      <form id="opinion-links-form" ref="form">
        <Input
          type="select"
          valueLink={this.linkState('form.type')}
          ref="type"
          label={this.getIntlMessage('opinion.link.type')}
          bsStyle={this.getFieldStyle('type')}
          groupClassName={this.getGroupStyle('type')}
          errors={this.renderFormErrors('type')}
        >
          <option value="" disabled selected>{this.getIntlMessage('global.select')}</option>
          {
            this.props.availableTypes.map((type) => {
              return <option key={type.id} value={type.id}>{type.label}</option>;
            })
          }
        </Input>

        <Input
          type="text"
          valueLink={this.linkState('form.title')}
          ref="title"
          label={this.getIntlMessage('opinion.title')}
          groupClassName={this.getGroupStyle('title')}
          errors={this.renderFormErrors('title')}
          bsStyle={this.getFieldStyle('title')}
        />

        <Input
          type="textarea"
          valueLink={null} // state is automatically updated by CkeditorMixin
          ref="body"
          label={this.getIntlMessage('opinion.body')}
          groupClassName={this.getGroupStyle('body')}
          errors={this.renderFormErrors('body')}
          bsStyle={this.getFieldStyle('body')}
        />

      </form>
    );
  },

});

export default OpinionLinkForm;
