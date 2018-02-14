// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { type FormProps, reduxForm, FieldArray, Field, SubmissionError } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import type { Dispatch } from '../../../types';
import type { ReplyForm_questionnaire } from './__generated__/ReplyForm_questionnaire.graphql';
import {
  formatInitialResponsesValues,
  renderResponses,
  type ResponsesInReduxForm,
} from '../../../utils/responsesHelper';
import renderComponent from '../../Form/Field';
import ReplyActions from '../../../actions/ReplyActions';
import AlertForm from '../../Alert/AlertForm';

type Props = FormProps & {
  +questionnaire: ReplyForm_questionnaire,
  +intl: IntlShape,
  // disabled?: boolean,
};

type FormValues = {|
  responses: ResponsesInReduxForm,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { questionnaire } = props;
  const { responses } = values;

  const data = {};

  data.responses = responses;

  if (questionnaire.anonymousAllowed) {
    data.private = true; // to change with true value
  }

  console.log(questionnaire.id, data);

  return ReplyActions.add(questionnaire.id, data)
    .then(() => {})
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = (values: FormValues, props: Props) => {
  // Add FormValues
  const { questionnaire } = props;
  const { responses } = values;
  const errors = {};

  const responsesError = [];
  questionnaire.questions.map((question, index) => {
    responsesError[index] = {};
    const response = responses.filter(res => res && res.question === question.id)[0];

    if (question.required) {
      if (question.type === 'medias') {
        if (!response || (Array.isArray(response.value) && response.value.length === 0)) {
          responsesError[index] = { value: 'proposal.constraints.field_mandatory' };
        }
      } else if (!response || !response.value) {
        responsesError[index] = { value: 'proposal.constraints.field_mandatory' };
      }
    }

    if (
      question.validationRule &&
      question.type !== 'button' &&
      response.value &&
      typeof response.value === 'object' &&
      Array.isArray(response.value.labels)
    ) {
      const rule = question.validationRule;
      const labelsNumber = response.value.labels.length;
      const hasOtherValue = response.value.other ? 1 : 0;
      const responsesNumber = labelsNumber + hasOtherValue;

      if (rule.type === 'min' && (rule.number && responsesNumber < rule.number)) {
        responsesError[index] = {
          value: props.intl.formatMessage(
            { id: 'reply.constraints.choices_min' },
            { nb: rule.number },
          ),
        };
      }

      if (rule.type === 'max' && (rule.number && responsesNumber > rule.number)) {
        responsesError[index] = {
          value: props.intl.formatMessage(
            { id: 'reply.constraints.choices_max' },
            { nb: rule.number },
          ),
        };
      }

      if (rule.type === 'equal' && responsesNumber !== rule.number) {
        responsesError[index] = {
          value: props.intl.formatMessage(
            { id: 'reply.constraints.choices_equal' },
            { nb: rule.number },
          ),
        };
      }
    }
  });

  if (responsesError.length) {
    errors.responses = responsesError;
  }

  return errors;
};

export const formName = 'ReplyForm';

export class ReplyForm extends React.Component<Props> {
  render() {
    const {
      intl,
      questionnaire,
      submitting,
      pristine,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
    } = this.props;

    return (
      <form id="reply-form" ref="form" onSubmit={handleSubmit}>
        {questionnaire.description && (
          <p dangerouslySetInnerHTML={{ __html: questionnaire.description }} />
        )}
        <FieldArray
          name="responses"
          component={renderResponses}
          questions={questionnaire.questions}
          intl={intl}
        />
        {questionnaire.anonymousAllowed && (
          <div>
            <hr style={{ marginBottom: '30px' }} />
            <Field
              type="checkbox"
              name="reply-private"
              component={renderComponent}
              // checkedLink={this.linkState('private')}
              children={<FormattedMessage id="reply.form.private" />}
              // disabled={false} // to change
            />
          </div>
        )}
        <Button
          type="submit"
          id="proposal_admin_content_save"
          bsStyle="primary"
          disabled={pristine || invalid || submitting}>
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
        </Button>
        <AlertForm
          valid={valid}
          invalid={invalid}
          submitSucceeded={submitSucceeded}
          submitFailed={submitFailed}
          submitting={submitting}
        />
      </form>
    );
  }

  // getInitialState() {
  //   const { reply } = this.props;
  //   const form = {};
  //   this.props.form.fields.forEach(field => {
  //     if (field.type === 'button') {
  //       form[field.id] = field.choices[0].label;
  //     } else if (field.type === 'checkbox') {
  //       form[field.id] = [];
  //     } else {
  //       form[field.id] = '';
  //     }
  //
  //     reply.responses.map(response => {
  //       form[response.field.id] = response.value;
  //     });
  //
  //     let fieldRules = {};
  //
  //     if (field.required) {
  //       if (field.type === 'checkbox' || field.type === 'ranking') {
  //         fieldRules = {
  //           notEmpty: { message: 'reply.constraints.field_mandatory' },
  //         };
  //       } else {
  //         fieldRules = {
  //           notBlank: { message: 'reply.constraints.field_mandatory' },
  //         };
  //       }
  //     }
  //     if (field.validationRule && field.type !== 'button') {
  //       const rule = field.validationRule;
  //       switch (rule.type) {
  //         case 'min':
  //           fieldRules.min = {
  //             message: 'reply.constraints.choices_min',
  //             messageParams: { nb: rule.number },
  //             value: rule.number,
  //           };
  //           break;
  //         case 'max':
  //           fieldRules.max = {
  //             message: 'reply.constraints.choices_max',
  //             messageParams: { nb: rule.number },
  //             value: rule.number,
  //           };
  //           break;
  //         case 'equal':
  //           fieldRules.length = {
  //             message: 'reply.constraints.choices_equal',
  //             messageParams: { nb: rule.number },
  //             value: rule.number,
  //           };
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //     this.formValidationRules[field.id] = fieldRules;
  //   });
  //
  //   return {
  //     form,
  //     errors: {},
  //     private: false,
  //   };
  // },

  // componentWillReceiveProps(nextProps) {
  //   const {
  //     onSubmitSuccess,
  //     onSubmitFailure,
  //     onValidationFailure,
  //     disabled,
  //     form,
  //     isSubmitting,
  //   } = this.props;
  //   if (!disabled && nextProps.isSubmitting && !isSubmitting) {
  //     if (this.isValid()) {
  //       const responses = [];
  //       const data = {};
  //       Object.keys(this.state.form).map(key => {
  //         const response = { question: key };
  //         if (Array.isArray(this.state.form[key])) {
  //           let currentField = null;
  //           form.fields.map(field => {
  //             if (String(field.id) === key) {
  //               currentField = field;
  //             }
  //           });
  //
  //           const choicesLabels = [];
  //           currentField.choices.forEach(choice => {
  //             choicesLabels.push(choice.label);
  //           });
  //
  //           let other = null;
  //           this.state.form[key].map((value, i) => {
  //             if (choicesLabels.indexOf(value) === -1) {
  //               this.state.form[key].splice(i, 1);
  //               other = value;
  //             }
  //           });
  //           response.value = other
  //             ? { labels: this.state.form[key], other }
  //             : { labels: this.state.form[key] };
  //         } else {
  //           response.value = this.state.form[key];
  //         }
  //         responses.push(response);
  //       });
  //
  //       data.responses = responses;
  //       if (form.anonymousAllowed) {
  //         data.private = this.state.private;
  //       }
  //
  //       return ReplyActions.add(form.id, data)
  //         .then(onSubmitSuccess)
  //         .catch(onSubmitFailure);
  //     }
  //     onValidationFailure();
  //   }
  // }

  // onChange(field, value) {
  //   const form = this.state.form;
  //   if (field) {
  //     form[field.id] = value;
  //   }
  //   this.setState({
  //     form,
  //   });
  // }

  // getResponseForField(id) {
  //   const { reply } = this.props;
  //   const index = ArrayHelper.getElementIndexFromArray(
  //     reply.responses,
  //     { field: { id } },
  //     'field',
  //     'id',
  //   );
  //   if (index > -1) {
  //     return reply.responses[index].value;
  //   }
  //   return '';
  // }

  // emptyForm() {
  //   const form = {};
  //   this.props.form.fields.forEach(field => {
  //     form[field.id] = field.type === 'checkbox' || field.type === 'ranking' ? [] : '';
  //     if (
  //       field.type === 'checkbox' ||
  //       field.type === 'radio' ||
  //       field.type === 'ranking' ||
  //       field.type === 'button'
  //     ) {
  //       this[`field-${field.id}`].empty();
  //     }
  //   });
  //   this.setState({
  //     form,
  //     private: false,
  //   });
  // }

  // render() {
  //   const { disabled, form } = this.props;
  //   const strategy = getRequiredFieldIndicationStrategory(form.fields);
  //   return (
  //     <form id="reply-form" ref="form">
  //       {form.description && (
  //         <div style={{ color: 'black' }} dangerouslySetInnerHTML={{ __html: form.description }} />
  //       )}
  //       {strategy === 'all_required' && (
  //         <Alert bsStyle="warning">Tous les champs sont obligatoires</Alert>
  //       )}
  //       {form.fields.map(field => {
  //         const key = field.slug;
  //         const inputType = field.type || 'text';
  //         const labelAppend = field.required
  //           ? strategy === 'minority_required'
  //             ? ' <span class="small warning">Obligatoire</span>'
  //             : ''
  //           : strategy === 'majority_required' || strategy === 'half_required'
  //             ? ' <span class="small excerpt">Facultatif</span>'
  //             : '';
  //         const labelMessage = field.question + labelAppend;
  //         const label = <span dangerouslySetInnerHTML={{ __html: labelMessage }} />;
  //         switch (inputType) {
  //           case 'checkbox':
  //             return (
  //               <Checkbox
  //                 key={key}
  //                 ref={c => (this[`field-${field.id}`] = c)}
  //                 id={`reply-${field.id}`}
  //                 field={field}
  //                 getGroupStyle={this.getGroupStyle}
  //                 renderFormErrors={this.renderFormErrors}
  //                 onChange={this.onChange}
  //                 values={this.state.form}
  //                 label={label}
  //                 labelClassName="h4"
  //                 disabled={disabled}
  //               />
  //             );
  //           case 'radio':
  //             return (
  //               <Radio
  //                 key={key}
  //                 ref={c => (this[`field-${field.id}`] = c)}
  //                 id={`reply-${field.id}`}
  //                 field={field}
  //                 getGroupStyle={this.getGroupStyle}
  //                 renderFormErrors={this.renderFormErrors}
  //                 onChange={this.onChange}
  //                 label={label}
  //                 labelClassName="h4"
  //                 disabled={disabled}
  //               />
  //             );
  //           case 'select':
  //             return (
  //               <Input
  //                 key={key}
  //                 ref={c => (this[`field-${field.id}`] = c)}
  //                 id={`reply-${field.id}`}
  //                 type={inputType}
  //                 help={field.helpText}
  //                 groupClassName={this.getGroupStyle(field.id)}
  //                 valueLink={this.linkState(`form.${field.id}`)}
  //                 errors={this.renderFormErrors(field.id)}
  //                 defaultValue=""
  //                 label={label}
  //                 labelClassName="h4"
  //                 disabled={disabled}>
  //                 <option value="" disabled>
  //                   {<FormattedMessage id="global.select" />}
  //                 </option>
  //                 {field.choices.map(choice => (
  //                   <option key={choice.id} value={choice.label}>
  //                     {choice.label}
  //                   </option>
  //                 ))}
  //               </Input>
  //             );
  //           case 'ranking':
  //             return (
  //               <Ranking
  //                 key={key}
  //                 ref={c => (this[`field-${field.id}`] = c)}
  //                 id={`reply-${field.id}`}
  //                 field={field}
  //                 getGroupStyle={this.getGroupStyle}
  //                 renderFormErrors={this.renderFormErrors}
  //                 onChange={this.onChange}
  //                 label={label}
  //                 labelClassName="h4"
  //                 disabled={disabled}
  //               />
  //             );
  //           case 'button':
  //             return (
  //               <div className="form-group" id={`reply-${field.id}`}>
  //                 <label htmlFor={`reply-${field.id}`} className="control-label h4">
  //                   {label}
  //                 </label>
  //                 {field.helpText && (
  //                   <span className="help-block" key="help">
  //                     {field.helpText}
  //                   </span>
  //                 )}
  //                 {field.description && (
  //                   <div style={{ paddingTop: 15, paddingBottom: 25 }}>
  //                     <ButtonBody body={field.description || ''} />
  //                   </div>
  //                 )}
  //                 <RadioGroup
  //                   key={key}
  //                   horizontal
  //                   ref={c => (this[`field-${field.id}`] = c)}
  //                   id={`reply-${field.id}`}
  //                   onChange={value => {
  //                     this.onChange(field, value);
  //                   }}
  //                   value={field.choices[0].label}>
  //                   {field.choices.map(choice => (
  //                     <RadioButton
  //                       key={choice.id}
  //                       value={choice.label}
  //                       iconSize={20}
  //                       pointColor={choice.color}>
  //                       {choice.label}
  //                     </RadioButton>
  //                   ))}
  //                 </RadioGroup>
  //               </div>
  //             );
  //           default:
  //             return (
  //               <Input
  //                 ref={c => (this[`field-${field.id}`] = c)}
  //                 key={key}
  //                 id={`reply-${field.id}`}
  //                 type={inputType}
  //                 help={field.helpText}
  //                 groupClassName={this.getGroupStyle(field.id)}
  //                 valueLink={this.linkState(`form.${field.id}`)}
  //                 errors={this.renderFormErrors(field.id)}
  //                 placeholder="reply.your_response"
  //                 label={label}
  //                 labelClassName="h4"
  //                 disabled={disabled}
  //               />
  //             );
  //         }
  //       })}
  //       {form.anonymousAllowed && (
  //         <div>
  //           <hr style={{ marginBottom: '30px' }} />
  //           <Input
  //             type="checkbox"
  //             name="reply-private"
  //             checkedLink={this.linkState('private')}
  //             children={<FormattedMessage id="reply.form.private" />}
  //             disabled={disabled}
  //           />
  //         </div>
  //       )}
  //     </form>
  //   );
  // }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state, props: Props) => ({
  initialValues: {
    responses: formatInitialResponsesValues(props.questionnaire.questions, []),
  },
});

const form = reduxForm({
  validate,
  onSubmit,
  form: formName,
})(ReplyForm);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  questionnaire: graphql`
    fragment ReplyForm_questionnaire on Questionnaire {
      anonymousAllowed
      description
      title
      id
      questions {
        id
        title
        position
        private
        required
        helpText
        type
        isOtherAllowed
        validationRule {
          type
          number
        }
        choices {
          id
          title
          description
          color
          image {
            url
          }
        }
      }
    }
  `,
});
