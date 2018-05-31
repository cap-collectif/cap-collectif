import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Alert } from 'react-bootstrap';
import { RadioGroup, RadioButton } from 'react-radio-buttons';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import FlashMessages from '../../Utils/FlashMessages';
import ArrayHelper from '../../../services/ArrayHelper';
import Input from '../../Form/Input';
import Radio from '../../Form/Radio';
import Checkbox from '../../Form/Checkbox';
import Ranking from '../../Form/Ranking';
import ReplyActions from '../../../actions/ReplyActions';
import ButtonBody from './ButtonBody';

const getRequiredFieldIndicationStrategory = (fields: Array<{ required: boolean }>) => {
  const numberOfRequiredFields = fields.reduce((a, b) => a + (b.required ? 1 : 0), 0);
  const numberOfFields = fields.length;
  const halfNumberOfFields = numberOfFields / 2;
  if (numberOfRequiredFields === 0) {
    return 'no_required';
  }
  if (numberOfRequiredFields === numberOfFields) {
    return 'all_required';
  }
  if (numberOfRequiredFields === halfNumberOfFields) {
    return 'half_required';
  }
  if (numberOfRequiredFields > halfNumberOfFields) {
    return 'majority_required';
  }
  return 'minority_required';
};

const ReplyForm = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    onValidationFailure: PropTypes.func.isRequired,
    onSubmitSuccess: PropTypes.func.isRequired,
    onSubmitFailure: PropTypes.func.isRequired,
    reply: PropTypes.object,
    disabled: PropTypes.bool,
  },

  mixins: [DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      reply: {
        responses: [],
      },
      disabled: false,
    };
  },

  getInitialState() {
    const { reply } = this.props;
    const form = {};
    this.props.form.fields.forEach(field => {
      if (field.type === 'button') {
        form[field.id] = field.choices[0].label;
      } else if (field.type === 'checkbox') {
        form[field.id] = [];
      } else {
        form[field.id] = '';
      }

      reply.responses.map(response => {
        form[response.field.id] = response.value;
      });

      let fieldRules = {};

      if (field.required) {
        if (field.type === 'checkbox' || field.type === 'ranking') {
          fieldRules = {
            notEmpty: { message: 'reply.constraints.field_mandatory' },
          };
        } else {
          fieldRules = {
            notBlank: { message: 'reply.constraints.field_mandatory' },
          };
        }
      }
      if (field.validationRule && field.type !== 'button') {
        const rule = field.validationRule;
        switch (rule.type) {
          case 'min':
            fieldRules.min = {
              message: 'reply.constraints.choices_min',
              messageParams: { nb: rule.number },
              value: rule.number,
            };
            break;
          case 'max':
            fieldRules.max = {
              message: 'reply.constraints.choices_max',
              messageParams: { nb: rule.number },
              value: rule.number,
            };
            break;
          case 'equal':
            fieldRules.length = {
              message: 'reply.constraints.choices_equal',
              messageParams: { nb: rule.number },
              value: rule.number,
            };
            break;
          default:
            break;
        }
      }
      this.formValidationRules[field.id] = fieldRules;
    });

    return {
      form,
      errors: {},
      private: false,
    };
  },

  componentWillReceiveProps(nextProps) {
    const {
      onSubmitSuccess,
      onSubmitFailure,
      onValidationFailure,
      disabled,
      form,
      isSubmitting,
    } = this.props;
    if (!disabled && nextProps.isSubmitting && !isSubmitting) {
      if (this.isValid()) {
        const responses = [];
        const data = {};
        Object.keys(this.state.form).map(key => {
          const response = { question: key };
          if (Array.isArray(this.state.form[key])) {
            let currentField = null;
            form.fields.map(field => {
              if (String(field.id) === key) {
                currentField = field;
              }
            });

            const choicesLabels = [];
            currentField.choices.forEach(choice => {
              choicesLabels.push(choice.label);
            });

            let other = null;
            this.state.form[key].map((value, i) => {
              if (choicesLabels.indexOf(value) === -1) {
                this.state.form[key].splice(i, 1);
                other = value;
              }
            });
            response.value = other
              ? { labels: this.state.form[key], other }
              : { labels: this.state.form[key] };
          } else {
            response.value = this.state.form[key];
          }
          responses.push(response);
        });

        data.responses = responses;
        if (form.anonymousAllowed) {
          data.private = this.state.private;
        }

        return ReplyActions.add(form.id, data)
          .then(onSubmitSuccess)
          .catch(onSubmitFailure);
      }
      onValidationFailure();
    }
  },

  onChange(field, value) {
    const form = this.state.form;
    if (field) {
      form[field.id] = value;
    }
    this.setState({
      form,
    });
  },

  getResponseForField(id) {
    const { reply } = this.props;
    const index = ArrayHelper.getElementIndexFromArray(
      reply.responses,
      { field: { id } },
      'field',
      'id',
    );
    if (index > -1) {
      return reply.responses[index].value;
    }
    return '';
  },

  emptyForm() {
    const form = {};
    this.props.form.fields.forEach(field => {
      form[field.id] = field.type === 'checkbox' || field.type === 'ranking' ? [] : '';
      if (
        field.type === 'checkbox' ||
        field.type === 'radio' ||
        field.type === 'ranking' ||
        field.type === 'button'
      ) {
        this[`field-${field.id}`].empty();
      }
    });
    this.setState({
      form,
      private: false,
    });
  },

  formValidationRules: {},

  renderFormErrors(field) {
    const errors = this.getErrorsMessages(field);
    if (errors.length === 0) {
      return null;
    }
    return <FlashMessages errors={errors} form />;
  },

  render() {
    const { disabled, form } = this.props;
    const strategy = getRequiredFieldIndicationStrategory(form.fields);
    return (
      <form id="reply-form" ref="form">
        {form.description && (
          <div
            style={{ color: 'black', marginBottom: 30 }}
            dangerouslySetInnerHTML={{ __html: form.description }}
          />
        )}
        {strategy === 'all_required' && (
          <Alert bsStyle="warning">Tous les champs sont obligatoires</Alert>
        )}
        {form.fields.map(field => {
          const key = field.slug;
          const inputType = field.type || 'text';
          const labelAppend = field.required
            ? strategy === 'minority_required'
              ? ' <span class="small warning">Obligatoire</span>'
              : ''
            : strategy === 'majority_required' || strategy === 'half_required'
              ? ' <span class="small excerpt">Facultatif</span>'
              : '';
          const labelMessage = field.question + labelAppend;
          const label = <span dangerouslySetInnerHTML={{ __html: labelMessage }} />;
          switch (inputType) {
            case 'checkbox':
              return (
                <Checkbox
                  key={key}
                  ref={c => (this[`field-${field.id}`] = c)}
                  id={`reply-${field.id}`}
                  field={field}
                  getGroupStyle={this.getGroupStyle}
                  renderFormErrors={this.renderFormErrors}
                  onChange={this.onChange}
                  values={this.state.form}
                  label={label}
                  disabled={disabled}
                />
              );
            case 'radio':
              return (
                <Radio
                  key={key}
                  ref={c => (this[`field-${field.id}`] = c)}
                  id={`reply-${field.id}`}
                  field={field}
                  getGroupStyle={this.getGroupStyle}
                  renderFormErrors={this.renderFormErrors}
                  onChange={this.onChange}
                  label={label}
                  disabled={disabled}
                />
              );
            case 'select':
              return (
                <Input
                  key={key}
                  ref={c => (this[`field-${field.id}`] = c)}
                  id={`reply-${field.id}`}
                  type={inputType}
                  description={field.description}
                  help={field.helpText}
                  groupClassName={this.getGroupStyle(field.id)}
                  valueLink={this.linkState(`form.${field.id}`)}
                  errors={this.renderFormErrors(field.id)}
                  defaultValue=""
                  label={label}
                  disabled={disabled}>
                  <option value="" disabled>
                    {<FormattedMessage id="global.select" />}
                  </option>
                  {field.choices.map(choice => (
                    <option key={choice.id} value={choice.label}>
                      {choice.label}
                    </option>
                  ))}
                </Input>
              );
            case 'ranking':
              return (
                <Ranking
                  key={key}
                  ref={c => (this[`field-${field.id}`] = c)}
                  id={`reply-${field.id}`}
                  field={field}
                  getGroupStyle={this.getGroupStyle}
                  renderFormErrors={this.renderFormErrors}
                  onChange={this.onChange}
                  label={label}
                  disabled={disabled}
                />
              );
            case 'button':
              return (
                <div className="form-group" id={`reply-${field.id}`}>
                  <label htmlFor={`reply-${field.id}`} className="control-label h5">
                    {label}
                  </label>
                  {field.helpText && (
                    <span className="help-block" key="help">
                      {field.helpText}
                    </span>
                  )}
                  {field.description && (
                    <div style={{ paddingTop: 15, paddingBottom: 25 }}>
                      <ButtonBody body={field.description || ''} />
                    </div>
                  )}
                  <RadioGroup
                    key={key}
                    horizontal
                    ref={c => (this[`field-${field.id}`] = c)}
                    id={`reply-${field.id}`}
                    onChange={value => {
                      this.onChange(field, value);
                    }}
                    value={field.choices[0].label}>
                    {field.choices.map(choice => (
                      <RadioButton
                        key={choice.id}
                        value={choice.label}
                        iconSize={20}
                        pointColor={choice.color}>
                        {choice.label}
                      </RadioButton>
                    ))}
                  </RadioGroup>
                </div>
              );
            default:
              return (
                <Input
                  ref={c => (this[`field-${field.id}`] = c)}
                  key={key}
                  id={`reply-${field.id}`}
                  type={inputType}
                  help={field.helpText}
                  groupClassName={this.getGroupStyle(field.id)}
                  valueLink={this.linkState(`form.${field.id}`)}
                  errors={this.renderFormErrors(field.id)}
                  placeholder="reply.your_response"
                  label={label}
                  disabled={disabled}
                />
              );
          }
        })}
        {form.anonymousAllowed && (
          <div>
            <hr style={{ marginBottom: '30px' }} />
            <Input
              type="checkbox"
              name="reply-private"
              checkedLink={this.linkState('private')}
              children={<FormattedMessage id="reply.form.private" />}
              disabled={disabled}
            />
          </div>
        )}
      </form>
    );
  },
});

export default ReplyForm;
