import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import FormMixin from '../../../utils/FormMixin';
import DeepLinkStateMixin from '../../../utils/DeepLinkStateMixin';
import FlashMessages from '../../Utils/FlashMessages';
import ArrayHelper from '../../../services/ArrayHelper';
import Input from '../../Form/Input';
import Radio from '../../Form/Radio';
import Checkbox from '../../Form/Checkbox';
import Ranking from '../../Form/Ranking';
import ReplyActions from '../../../actions/ReplyActions';

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
  mixins: [IntlMixin, DeepLinkStateMixin, FormMixin],

  getDefaultProps() {
    return {
      reply: {
        responses: [],
      },
      disabled: false,
    };
  },

  getInitialState() {
    const form = {};
    this.props.form.fields.forEach((field) => {
      form[field.id] = field.type === 'checkbox' ? [] : '';

      this.props.reply.responses.map((response) => {
        form[response.field.id] = response.value;
      });

      if (field.required) {
        if (field.type === 'checkbox') {
          this.formValidationRules[field.id] = {
            notEmpty: { message: 'reply.constraints.field_mandatory' },
          };
        } else {
          this.formValidationRules[field.id] = {
            notBlank: { message: 'reply.constraints.field_mandatory' },
          };
        }
      }
    });

    return {
      form,
      errors: {},
      private: false,
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!this.props.disabled && nextProps.isSubmitting && !this.props.isSubmitting) {
      const {
        onSubmitSuccess,
        onSubmitFailure,
        onValidationFailure,
      } = this.props;
      if (this.isValid()) {
        const responses = [];
        const data = {};
        Object.keys(this.state.form).map((key) => {
          const response = { question: key };

          if (Array.isArray(this.state.form[key])) {
            const currentField = this.props.form.fields.find((field) => {
              return String(field.id) === key;
            });

            const choicesLabels = [];
            currentField.choices.forEach((choice) => {
              choicesLabels.push(choice.label);
            });

            const other = this.state.form[key].find((value, i) => {
              if (choicesLabels.indexOf(value) === -1) {
                this.state.form[key].splice(i, 1);
                return true;
              }
            });
            response.value = other ? { labels: this.state.form[key], other: other } : { labels: this.state.form[key] };
          } else {
            response.value = this.state.form[key];
          }
          responses.push(response);
        });

        data.responses = responses;
        if (this.props.form.anonymousAllowed) {
          data.private = this.state.private;
        }

        return ReplyActions
          .add(this.props.form.id, data)
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
      form: form,
    });
  },

  getResponseForField(id) {
    const index = ArrayHelper.getElementIndexFromArray(
      this.props.reply.responses,
      { field: { id: id } },
      'field',
      'id'
    );
    if (index > -1) {
      return this.props.reply.responses[index].value;
    }
    return '';
  },

  emptyForm() {
    const form = {};
    this.props.form.fields.forEach((field) => {
      form[field.id] = field.type === 'checkbox' ? [] : '';
      if (field.type === 'checkbox' || field.type === 'radio') {
        this['field-' + field.id].empty();
      }
    });
    this.setState({
      form: form,
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
    const optional = this.getIntlMessage('global.form.optional');
    const { disabled } = this.props;
    return (
      <form id="reply-form" ref="form">
        {
          this.props.form.description
          ? <div>
            <hr />
            <FormattedHTMLMessage message={this.props.form.description} />
            <hr />
          </div>
          : null
        }
        {
          this.props.form.fields.map((field) => {
            const key = field.slug;
            const inputType = field.type || 'text';

            switch (inputType) {
              case 'checkbox':
                return (
                  <Checkbox
                    key={key}
                    ref={c => this['field-' + field.id] = c}
                    id={'reply-' + field.id}
                    field={field}
                    getGroupStyle={this.getGroupStyle}
                    renderFormErrors={this.renderFormErrors}
                    onChange={this.onChange}
                    values={this.state.form}
                    labelClassName="h4"
                    disabled={disabled}
                  />
                );

              case 'radio':
                return (
                  <Radio
                    key={key}
                    ref={c => this['field-' + field.id] = c}
                    id={'reply-' + field.id}
                    field={field}
                    getGroupStyle={this.getGroupStyle}
                    renderFormErrors={this.renderFormErrors}
                    onChange={this.onChange}
                    labelClassName="h4"
                    disabled={disabled}
                  />
                );

              case 'select':
                return (
                  <Input
                    key={key}
                    ref={c => this['field-' + field.id] = c}
                    id={'reply-' + field.id}
                    type={inputType}
                    label={field.question + (field.required ? '' : optional)}
                    help={field.helpText}
                    groupClassName={this.getGroupStyle(field.id)}
                    valueLink={this.linkState('form.' + field.id)}
                    errors={this.renderFormErrors(field.id)}
                    defaultValue=""
                    labelClassName="h4"
                    disabled={disabled}
                  >
                    <option value="" disabled>{this.getIntlMessage('global.select')}</option>
                    {
                      field.choices.map((choice) => {
                        return <option key={choice.id} value={choice.label}>{choice.label}</option>;
                      })
                    }
                  </Input>
                );

              case 'ranking':
                return (
                  <Ranking
                    key={key}
                    ref={c => this['field-' + field.id] = c}
                    id={'reply-' + field.id}
                    field={field}
                    getGroupStyle={this.getGroupStyle}
                    renderFormErrors={this.renderFormErrors}
                    onChange={this.onChange}
                    labelClassName="h4"
                  />
                );

              default:
                return (
                  <Input
                    ref={c => this['field-' + field.id] = c}
                    key={key}
                    id={'reply-' + field.id}
                    type={inputType}
                    label={field.question + (field.required ? '' : optional)}
                    help={field.helpText}
                    groupClassName={this.getGroupStyle(field.id)}
                    valueLink={this.linkState('form.' + field.id)}
                    errors={this.renderFormErrors(field.id)}
                    placeholder={this.getIntlMessage('reply.your_response')}
                    labelClassName="h4"
                    disabled={disabled}
                  />
                );
            }
          })
        }
        {
          this.props.form.anonymousAllowed
            ? <div>
              <hr style={{ marginBottom: '30px' }} />
              <Input
                type="checkbox"
                name="reply-private"
                checkedLink={this.linkState('private')}
                label={this.getIntlMessage('reply.form.private')}
                disabled={disabled}
              />
            </div>
            : null
        }
      </form>
    );
  },

});

export default ReplyForm;
