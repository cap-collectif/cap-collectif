import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import OpinionLinkActions from '../../../actions/OpinionLinkActions';
import FlashMessages from '../../Utils/FlashMessages';
import Input from '../../Form/Input';
import ArrayHelper from '../../../services/ArrayHelper';

const OpinionForm = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    action: React.PropTypes.bool.isRequired,
    availableTypes: React.PropTypes.array.isRequired,
    isSubmitting: React.PropTypes.bool.isRequired,
    onValidationFailure: React.PropTypes.func.isRequired,
    onSubmitSuccess: React.PropTypes.func.isRequired,
    onSubmitFailure: React.PropTypes.func.isRequired,
  },
  mixins: [ReactIntl.IntlMixin, DeepLinkStateMixin, FormMixin],

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
      custom: {},
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSubmitting === true) {
      if (this.isValid()) {
        const step = this.props.opinion.step;
        const appendices = [];
        const form = this.state.form;
        Object.keys(this.state.custom).map((key) => {
          const appendixType = key.split('-')[1];
          appendices.push({
            body: this.state.custom[key],
            appendixType: appendixType,
          });
        });
        form.appendices = appendices;
        OpinionLinkActions
          .add(step.projectId, step.id, form)
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

  onTypeChange(ev) {
    this.updateAppendices(parseInt(ev.target.value));
  },

  getAppendixTypeForType(type) {
    const selectedType = ArrayHelper.getElementFromArray(this.props.availableTypes, type);
    if (selectedType) {
      return selectedType.appendixTypes;
    }
    return [];
  },

  updateAppendices(type) {
    const appendixTypes = this.getAppendixTypeForType(type);
    const form = this.state.form;
    const custom = {};
    form.type = type;
    appendixTypes.map((appendixType) => {
      const ref = 'appendix-' + appendixType.id;
      custom[ref] = null;
    });
    this.setState({
      form: form,
      custom: custom,
    });
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
    const selectedType = ArrayHelper.getElementFromArray(this.props.availableTypes, parseInt(this.state.form.type));
    const appendixTypes = selectedType ? selectedType.appendixTypes : [];
    return (
      <form id="opinion-links-form" ref="form">
        <Input
          type="select"
          ref="type"
          id="opinion_type"
          onChange={this.onTypeChange}
          label={this.getIntlMessage('opinion.link.type')}
          groupClassName={this.getGroupStyle('type')}
          errors={this.renderFormErrors('type')}
        >
          <option value="" disabled selected>{this.getIntlMessage('global.select')}</option>
          {
            this.props.availableTypes.map((type) => {
              return <option key={type.id} value={type.id}>{type.title}</option>;
            })
          }
        </Input>

        <Input
          type="text"
          valueLink={this.linkState('form.title')}
          ref="title"
          id="opinion_title"
          label={this.getIntlMessage('opinion.title')}
          groupClassName={this.getGroupStyle('title')}
          errors={this.renderFormErrors('title')}
        />

        <Input
          type="editor"
          id="opinion_body"
          valueLink={this.linkState('form.body')}
          label={this.getIntlMessage('opinion.body')}
          groupClassName={this.getGroupStyle('body')}
          errors={this.renderFormErrors('body')}
        />

        {
          appendixTypes.map((appendixType) => {
            const key = 'appendix-' + appendixType.id;
            return (
              <Input
                id={'opinion_' + key}
                type="editor"
                label={appendixType.title}
                groupClassName={this.getGroupStyle(key)}
                valueLink={this.linkState('custom.' + key)}
                errors={this.renderFormErrors(key)}
              />
            );
          })
        }

      </form>
    );
  },

});

export default OpinionForm;
