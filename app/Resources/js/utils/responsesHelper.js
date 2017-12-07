// @flow
import * as React from 'react';
import { type IntlShape } from 'react-intl';
import { type FieldArrayProps, Field } from 'redux-form';
import ProposalPrivateField from '../components/Proposal/ProposalPrivateField';
import { MultipleChoiceRadio } from '../components/Form/MultipleChoiceRadio';
import component from '../components/Form/Field';

type Questions = $ReadOnlyArray<{|
  +id: string,
  +title: string,
  +helpText: ?string,
  +type:
    | 'text'
    | 'textarea'
    | 'editor'
    | 'radio'
    | 'select'
    | 'checkbox'
    | 'ranking'
    | 'medias'
    | 'button',
  +position: number,
  +private: boolean,
  +required: boolean,
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
  +medias?: $ReadOnlyArray<?{|
    +id: string,
    +name: string,
    +url: string,
    +size: string,
  |}>,
|}>;

export const formatSubmitResponses = (responses: Array<Object>, questions: Questions) => {
  return responses.map(res => {
    const question = questions.filter(q => res.question === q.id)[0];
    if (question.type !== 'medias') {
      return res;
    }
    return { ...res, medias: res.value ? res.value.map(value => value.id) : [], value: undefined };
  });
};

export const formatInitialResponsesValues = (questions: Questions, responses: ResponsesFromAPI) => {
  return questions.map(question => {
    const response = responses.filter(res => res && res.question.id === question.id)[0];
    if (response) {
      let responseValue = null;
      if (response.value) {
        const questionType = question.type;

        if (questionType === 'button') {
          responseValue = JSON.parse(response.value).labels[0];
        }

        if (questionType === 'radio') {
          responseValue = JSON.parse(response.value);
        }

        if (questionType === 'ranking') {
          responseValue = JSON.parse(response.value).labels;
        }

        if (questionType === 'checkbox') {
          responseValue = JSON.parse(response.value);
        }

        return {
          question: question.id,
          value: responseValue,
        };
      }
      if (response.medias) {
        return { question: question.id, value: response.medias };
      }
    }
    if (question.type === 'medias') {
      return { question: question.id, value: [] };
    }
    return { question: question.id, value: null };
  });
};

export const formatResponsesToSubmit = (values: Object, props: Object) => {
  const questions =
    props.proposal.form.evaluationForm && props.proposal.form.evaluationForm.questions;
  if (!questions) return [];
  return values.responses.map(resp => {
    const actualQuestion = questions.find(question => question.id === String(resp.question));

    if (!actualQuestion) throw new Error("Can't find the question");

    const questionType = actualQuestion.type;
    let value;
    if (questionType === 'ranking' || questionType === 'button') {
      value = JSON.stringify({
        labels: Array.isArray(resp.value) ? resp.value : [resp.value],
        other: null,
      });
    } else if (questionType === 'checkbox' || questionType === 'radio') {
      value = JSON.stringify(resp.value);
    } else {
      value = resp.value;
    }

    return {
      question: actualQuestion.id,
      value,
    };
  });
};

const formattedChoicesInField = field => {
  return field.choices.map(choice => {
    return {
      id: choice.id,
      label: choice.title,
      description: choice.description,
      color: choice.color,
    };
  });
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
  responses: Array<Object>,
  change: (field: string, value: any) => void,
  intl: IntlShape,
  disabled: boolean,
}) => (
  <div>
    {fields.map((member, index) => {
      const field = questions[index];
      const inputType = field.type || 'text';
      const isOtherAllowed = field.isOtherAllowed;

      let labelMessage = field.title;
      let intlMessage;
      if (field.required) {
        intlMessage = intl.formatMessage({ id: 'global.mandatory' });
      } else {
        intlMessage = intl.formatMessage({ id: 'global.optional' });
      }

      labelMessage += ` <span class="small warning">${intlMessage}</span>`;
      const label = <span dangerouslySetInnerHTML={{ __html: labelMessage }} />;

      switch (inputType) {
        case 'medias': {
          return (
            <ProposalPrivateField key={field.id} show={field.private}>
              <Field
                name={`${member}.value`}
                id={`reply-${field.id}`}
                type="medias"
                component={component}
                help={field.helpText}
                labelClassName="h4"
                placeholder="reply.your_response"
                label={label}
                disabled={disabled}
              />
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
                id={`reply-${field.id}`}
                type={inputType}
                component={component}
                help={field.helpText}
                isOtherAllowed={isOtherAllowed}
                labelClassName="h4"
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
