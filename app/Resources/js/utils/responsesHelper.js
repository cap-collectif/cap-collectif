// @flow
import * as React from 'react';
import { type IntlShape, FormattedMessage } from 'react-intl';
import { type FieldArrayProps, Field } from 'redux-form';
import type { QuestionTypeValue } from '../components/Proposal/Page/__generated__/ProposalPageEvaluation_proposal.graphql';
import ProposalPrivateField from '../components/Proposal/ProposalPrivateField';
import { MultipleChoiceRadio } from '../components/Form/MultipleChoiceRadio';

import component from '../components/Form/Field';

type Questions = $ReadOnlyArray<{|
  +id: string,
  +title: string,
  +position: number,
  +private: boolean,
  +required: boolean,
  +helpText: ?string,
  +type: QuestionTypeValue,
  +isOtherAllowed: boolean,
  +validationRule: ?{|
    +type: ?string,
    +number: ?string,
  |},
  +choices: ?$ReadOnlyArray<{|
    +id: string,
    +title: string,
    +description: ?string,
    +color: ?string,
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
  question: string,
  // eslint-disable-next-line flowtype/space-after-type-colon
  value:
    | ?string
    | $ReadOnlyArray<{|
        +id: string,
        +name: string,
        +url: string,
        +size: string,
      |}>,
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
  value?: ?string,
  question: string,
  medias?: ?$ReadOnlyArray<string>,
}>;

export const formatSubmitResponses = (
  responses: ?ResponsesInReduxForm,
  questions: Questions,
): SubmitResponses => {
  if (!responses) return [];
  return responses.map(res => {
    const question = questions.filter(q => res.question === q.id)[0];
    if (question.type === 'medias') {
      return {
        question: res.question,
        medias: Array.isArray(res.value) ? res.value.map(value => value.id) : [],
      };
    }
    let value = res.value;
    if (question.type === 'ranking' || question.type === 'button') {
      value = JSON.stringify({
        labels: Array.isArray(res.value) ? res.value : [res.value],
        other: null,
      });
    } else if (question.type === 'checkbox' || question.type === 'radio') {
      value = JSON.stringify(res.value);
    }
    if (typeof value === 'string') {
      return { value, question: res.question };
    }
    return { value: null, question: res.question };
  });
};

export const formatInitialResponsesValues = (
  questions: Questions,
  responses: ResponsesFromAPI,
): ResponsesInReduxForm => {
  return questions.map(question => {
    const response = responses.filter(res => res && res.question.id === question.id)[0];

    // If we have a previous response format it
    if (response) {
      if (typeof response.value !== 'undefined' && response.value !== null) {
        const questionType = question.type;

        // For some questions type we need to parse the JSON of previous value
        let responseValue = response.value;
        try {
          if (questionType === 'button') {
            responseValue = JSON.parse(response.value).labels[0];
          }
          if (questionType === 'radio' || questionType === 'checkbox') {
            responseValue = JSON.parse(response.value);
          }
          if (questionType === 'ranking') {
            responseValue = JSON.parse(response.value).labels;
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`Failed to parse : ${response.value}`);
        }
        return {
          question: question.id,
          value: responseValue,
        };
      }
      if (typeof response.medias !== 'undefined') {
        return { question: question.id, value: response.medias };
      }
    }
    // Otherwise we create an empty response
    if (question.type === 'medias') {
      return { question: question.id, value: [] };
    }
    return { question: question.id, value: null };
  });
};

const formattedChoicesInField = field => {
  return field.choices.map(choice => {
    return {
      id: choice.id,
      label: choice.title,
      description: choice.description,
      color: choice.color,
      image: choice.image
    };
  });
};

export const getRequiredFieldIndicationStrategory = (fields: Array<{ required: boolean }>) => {
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

export const renderResponses = ({
  fields,
  questions,
  responses,
  intl,
  change,
  disabled,
}: FieldArrayProps & {
  questions: Questions,
  responses: ResponsesInReduxForm,
  change: (field: string, value: any) => void,
  intl: IntlShape,
  disabled: boolean,
}) => {
  const strategy = getRequiredFieldIndicationStrategory(questions);

  return (
    <div>
      {fields.map((member, index) => {
        const field = questions[index];

        // console.log(field);

        const inputType = field.type || 'text';
        const isOtherAllowed = field.isOtherAllowed;

        const labelAppend = field.required
          ? strategy === 'minority_required'
            ? ` <span class="warning small"> ${intl.formatMessage({ id: 'global.mandatory' })}</span>`
            : ''
          : strategy === 'majority_required' || strategy === 'half_required'
            ? ` <span class="excerpt small"> ${intl.formatMessage({ id: 'global.optional' })}</span>`
            : '';

        const labelMessage = field.title + labelAppend;

        const label = <span dangerouslySetInnerHTML={{ __html: labelMessage }} />;

        switch (inputType) {
          case 'medias': {
            return (
              <ProposalPrivateField key={field.id} show={field.private}>
                <Field
                  name={`${member}.value`}
                  id={member}
                  type="medias"
                  component={component}
                  help={field.helpText}
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
                  id={member}
                  type={inputType}
                  component={component}
                  help={field.helpText}
                  isOtherAllowed={isOtherAllowed}
                  placeholder="reply.your_response"
                  label={label}
                  disabled={disabled}
                >
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
              choices = formattedChoicesInField(field, strategy);
              if (inputType === 'radio') {
                return (
                  <ProposalPrivateField key={field.id} show={field.private}>
                    <div key={`${member}-container`}>
                      <MultipleChoiceRadio
                        id={member}
                        name={member}
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
                  id={member}
                  type={inputType}
                  component={component}
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
