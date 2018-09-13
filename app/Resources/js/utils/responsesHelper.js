// @flow
import * as React from 'react';
import { type IntlShape, FormattedMessage } from 'react-intl';
import { type FieldArrayProps, Field } from 'redux-form';
import type { QuestionTypeValue } from '../components/Proposal/Page/__generated__/ProposalPageEvaluation_proposal.graphql';
import ProposalPrivateField from '../components/Proposal/ProposalPrivateField';
import { MultipleChoiceRadio } from '../components/Form/MultipleChoiceRadio';
import TitleInvertContrast from '../components/Ui/TitleInvertContrast';
import { checkOnlyNumbers } from '../services/Validator';

import component from '../components/Form/Field';

type Questions = $ReadOnlyArray<{|
  +id: string,
  +title: string,
  +private: boolean,
  +required: boolean,
  +helpText: ?string,
  +description: ?string,
  +type: QuestionTypeValue,
  +isOtherAllowed?: boolean,
  +validationRule?: ?{|
    +type: ?string,
    +number: ?number,
  |},
  +choices?: ?$ReadOnlyArray<{|
    +id: string,
    +title: string,
    +description: ?string,
    +color: ?string,
    +image: ?Object,
  |}>,
|}>;

type ResponsesFromAPI = $ReadOnlyArray<?{|
  +question: {|
    +id: string,
  |},
  +value?: ?string,
  +medias?: $ReadOnlyArray<{|
    +id: string,
    +name: string,
    +url: string,
    +size: string,
  |}>,
|}>;

export type ResponsesInReduxForm = $ReadOnlyArray<{|
  questionId: string,
  // eslint-disable-next-line flowtype/space-after-type-colon
  value:
    | ?string
    | ?number
    | $ReadOnlyArray<{|
        +id: string,
        +name: string,
        +url: string,
        +size: string,
      |}>
    | {|
        labels: $ReadOnlyArray<string>,
        other: ?string,
      |},
|}>;

// The real type is
//
// type SubmitResponses = $ReadOnlyArray<{|
//   value: string,
//   question: string,
// |} | {|
//   question: string,
//   medias: $ReadOnlyArray<string>,
// |}>;
type SubmitResponses = $ReadOnlyArray<{
  value?: ?string | ?number,
  question: string,
  medias?: ?$ReadOnlyArray<string>,
}>;

export const formatSubmitResponses = (
  responses: ?ResponsesInReduxForm,
  questions: Questions,
): SubmitResponses => {
  if (!responses) return [];
  return responses.map(res => {
    const { type: questionType } = questions.filter(q => res.questionId === q.id)[0];
    const question = res.questionId;
    if (questionType === 'medias') {
      return {
        question,
        medias: Array.isArray(res.value) ? res.value.map(value => value.id) : [],
      };
    }

    if (questionType === 'ranking' || questionType === 'button') {
      const value = JSON.stringify({
        labels: Array.isArray(res.value) ? res.value : [res.value],
        other: null,
      });
      return {
        question,
        value,
      };
    } else if (questionType === 'checkbox' || questionType === 'radio') {
      return {
        question,
        value: JSON.stringify(res.value),
      };
    } else if (questionType === 'number') {
      return {
        question,
        value: Number(res.value),
      };
    }
    return { value: null, question };
  });
};

export const getValueFromResponse = (questionType: string, responseValue: string) => {
  // For some questions type we need to parse the JSON of previous value
  try {
    if (questionType === 'button') {
      return JSON.parse(responseValue).labels[0];
    }
    if (questionType === 'radio' || questionType === 'checkbox') {
      return JSON.parse(responseValue);
    }
    if (questionType === 'ranking') {
      return JSON.parse(responseValue).labels;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Failed to parse : ${responseValue}`);
  }

  return responseValue;
};

export const formatInitialResponsesValues = (
  questions: Questions,
  responses: ResponsesFromAPI,
): ResponsesInReduxForm =>
  questions.map(question => {
    const response = responses.filter(res => res && res.question.id === question.id)[0];
    const questionId = question.id;
    // If we have a previous response format it
    if (response) {
      if (typeof response.value !== 'undefined' && response.value !== null) {
        return {
          questionId,
          value: getValueFromResponse(question.type, response.value),
        };
      }
      if (typeof response.medias !== 'undefined') {
        return { questionId, value: response.medias };
      }
    }
    // Otherwise we create an empty response
    if (question.type === 'medias') {
      return { questionId, value: [] };
    }
    if (question.type === 'radio' || question.type === 'checkbox') {
      return { questionId, value: { labels: [], other: null } };
    }
    return { questionId, value: null };
  });

const formattedChoicesInField = field =>
  field.choices.map(choice => ({
    id: choice.id,
    label: choice.title,
    description: choice.description,
    color: choice.color,
    image: choice.image,
  }));

export const getRequiredFieldIndicationStrategy = (fields: Questions) => {
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

const getResponseNumber = (value: any) => {
  if (typeof value === 'object' && Array.isArray(value.labels)) {
    const labelsNumber = value.labels.length;
    const hasOtherValue = value.other ? 1 : 0;
    return labelsNumber + hasOtherValue;
  }

  if (typeof value === 'object' && Array.isArray(value)) {
    return value.length;
  }

  return 0;
};

type ResponseError = ?{
  value: string,
};

type ResponsesError = ResponseError[];

export const validateResponses = (
  questions: Questions,
  responses: ResponsesInReduxForm,
  className: string,
  intl: IntlShape,
): {
  responses?: ResponsesError,
} => {
  const responsesError = questions
    .map(question => {
      const response = responses.filter(res => res && res.questionId === question.id)[0];
      if (question.required) {
        if (question.type === 'medias') {
          if (!response || (Array.isArray(response.value) && response.value.length === 0)) {
            return { value: `${className}.constraints.field_mandatory` };
          }
        } else if (!response || !response.value) {
          return { value: `${className}.constraints.field_mandatory` };
        }
      }

      if (
        question.type === 'number' &&
        response.value &&
        typeof response.value === 'string' &&
        checkOnlyNumbers(response.value)
      ) {
        return { value: `please-enter-a-number` };
      }

      if (
        question.validationRule &&
        question.type !== 'button' &&
        response.value &&
        typeof response.value === 'object' &&
        (Array.isArray(response.value.labels) || Array.isArray(response.value))
      ) {
        const rule = question.validationRule;
        const responsesNumber = getResponseNumber(response.value);
        if (rule.type === 'MIN' && (rule.number && responsesNumber < rule.number)) {
          return {
            value: intl.formatMessage({ id: 'reply.constraints.choices_min' }, { nb: rule.number }),
          };
        }

        if (rule.type === 'MAX' && (rule.number && responsesNumber > rule.number)) {
          return {
            value: intl.formatMessage({ id: 'reply.constraints.choices_max' }, { nb: rule.number }),
          };
        }

        if (rule.type === 'EQUAL' && responsesNumber !== rule.number) {
          return {
            value: intl.formatMessage(
              { id: 'reply.constraints.choices_equal' },
              { nb: rule.number },
            ),
          };
        }
      }
    })
    .filter(n => n);

  return responsesError && responsesError.length ? { responses: responsesError } : {};
};

export const renderResponses = ({
  fields,
  questions,
  responses,
  intl,
  form,
  change,
  disabled,
}: FieldArrayProps & {
  questions: Questions,
  responses: ResponsesInReduxForm,
  change: (field: string, value: any) => void,
  form: string,
  intl: IntlShape,
  disabled: boolean,
}) => {
  const strategy = getRequiredFieldIndicationStrategy(questions);
  return (
    <div>
      {fields.map((member, index) => {
        const field = questions[index];

        // We want to overidde the HTML verification of the input type number
        const inputType = field.type && field.type !== 'number' ? field.type : 'text';
        const isOtherAllowed = field.isOtherAllowed;

        const labelAppend = field.required
          ? strategy === 'minority_required'
            ? ` <span class="warning small"> ${intl.formatMessage({
                id: 'global.mandatory',
              })}</span>`
            : ''
          : strategy === 'majority_required' || strategy === 'half_required'
            ? ` <span class="excerpt small"> ${intl.formatMessage({
                id: 'global.optional',
              })}</span>`
            : '';

        const labelMessage = field.title + labelAppend;

        const label = <span dangerouslySetInnerHTML={{ __html: labelMessage }} />;

        switch (inputType) {
          case 'section': {
            return (
              <div key={field.id}>
                <TitleInvertContrast>{field.title}</TitleInvertContrast>
                <div dangerouslySetInnerHTML={{ __html: field.description }} />
              </div>
            );
          }
          case 'medias': {
            return (
              <ProposalPrivateField key={field.id} show={field.private}>
                <Field
                  name={`${member}.value`}
                  id={`${form}-${member}`}
                  type="medias"
                  component={component}
                  help={field.helpText}
                  description={field.description}
                  placeholder="reply.your_response"
                  label={label}
                  disabled={disabled}
                />
              </ProposalPrivateField>
            );
          }
          case 'select': {
            return (
              <ProposalPrivateField key={field.id} show={field.private}>
                <Field
                  name={`${member}.value`}
                  id={`${form}-${member}`}
                  type={inputType}
                  component={component}
                  help={field.helpText}
                  isOtherAllowed={isOtherAllowed}
                  description={field.description}
                  placeholder="reply.your_response"
                  label={label}
                  disabled={disabled}>
                  <option value="" disabled>
                    {<FormattedMessage id="global.select" />}
                  </option>
                  {field.choices.map(choice => (
                    <option key={choice.id} value={choice.title}>
                      {choice.title}
                    </option>
                  ))}
                </Field>
              </ProposalPrivateField>
            );
          }
          default: {
            let response;
            if (responses) {
              response = responses[index].value;
            }

            let choices = [];
            if (
              inputType === 'ranking' ||
              inputType === 'radio' ||
              inputType === 'checkbox' ||
              inputType === 'button'
            ) {
              choices = formattedChoicesInField(field);
              if (inputType === 'radio') {
                return (
                  <ProposalPrivateField key={field.id} show={field.private}>
                    <div key={`${member}-container`}>
                      <MultipleChoiceRadio
                        id={`${form}-${member}`}
                        name={member}
                        description={field.description}
                        helpText={field.helpText}
                        isOtherAllowed={isOtherAllowed}
                        label={label}
                        change={change}
                        choices={choices}
                        value={response}
                        disabled={disabled}
                      />
                    </div>
                  </ProposalPrivateField>
                );
              }
            }

            return (
              <ProposalPrivateField key={field.id} show={field.private}>
                <Field
                  name={`${member}.value`}
                  id={`${form}-${member}`}
                  type={inputType}
                  component={component}
                  description={field.description}
                  help={field.helpText}
                  isOtherAllowed={isOtherAllowed}
                  placeholder="reply.your_response"
                  choices={choices}
                  label={label}
                  disabled={disabled}
                />
              </ProposalPrivateField>
            );
          }
        }
      })}
    </div>
  );
};
