// @flow
import * as React from 'react';
import { type IntlShape } from 'react-intl';
import { graphql } from 'react-relay';
import { Field, type FieldArrayProps } from 'redux-form';
import type { QuestionTypeValue } from '~relay/ProposalPageEvaluation_proposal.graphql';
import type { LogicJumpConditionOperator } from '~relay/ReplyForm_questionnaire.graphql';
import { MultipleChoiceRadio } from '../components/Form/MultipleChoiceRadio';
import TitleInvertContrast from '../components/Ui/Typography/TitleInvertContrast';
import { checkOnlyNumbers } from '../services/Validator';
import component from '../components/Form/Field';
import PrivateBox from '../components/Ui/Boxes/PrivateBox';
import ConditionalJumps from './ConditionalJumps';
import WYSIWYGRender from '../components/Form/WYSIWYGRender';
import invariant from './invariant';
import type {
  MultipleChoiceQuestionValidationRulesTypes,
  QuestionChoiceColor,
} from '~relay/responsesHelper_question.graphql';

// eslint-disable-next-line no-unused-vars
const ResponseFragment = {
  response: graphql`
    fragment responsesHelper_response on Response {
      question {
        id
      }
      ... on ValueResponse {
        value
      }
      ... on MediaResponse {
        medias {
          id
          name
          size
          url
        }
      }
    }
  `,
};

/**
 * Ok we have two shared fragment for questions :
 * - responsesHelper_adminQuestion
 * - responsesHelper_question
 *
 * Because we need different configurations depending on frontend or backend…
 * We could use a variable (eg: isOnAdmin)
 * But this is currently not supported on shared fragment:
 * https://github.com/facebook/relay/issues/2118
 */

// eslint-disable-next-line no-unused-vars
const QuestionAdminFragment = {
  adminQuestion: graphql`
    fragment responsesHelper_adminQuestion on Question {
      __typename
      id
      title
      number
      private
      position
      required
      helpText
      jumps {
        id
        origin {
          id
        }
        destination {
          id
          title
          number
        }
        conditions {
          id
          operator
          question {
            id
            title
          }
          ... on MultipleChoiceQuestionLogicJumpCondition {
            value {
              id
              title
            }
          }
        }
      }
      alwaysJumpDestinationQuestion {
        id
        title
        number
      }
      description
      type
      ... on MultipleChoiceQuestion {
        isOtherAllowed
        randomQuestionChoices
        validationRule {
          type
          number
        }
        choices(allowRandomize: false) {
          # this is updated
          id
          title
          description
          color
          image {
            id
            url
          }
        }
      }
    }
  `,
};

// eslint-disable-next-line no-unused-vars
const QuestionFragment = {
  question: graphql`
    fragment responsesHelper_question on Question {
      __typename
      id
      title
      number
      private
      position
      required
      helpText
      jumps {
        id
        origin {
          id
        }
        destination {
          id
          title
          number
        }
        conditions {
          id
          operator
          question {
            id
            title
          }
          ... on MultipleChoiceQuestionLogicJumpCondition {
            value {
              id
              title
            }
          }
        }
      }
      alwaysJumpDestinationQuestion {
        id
        title
        number
      }
      description
      type
      ... on MultipleChoiceQuestion {
        isOtherAllowed
        randomQuestionChoices
        validationRule {
          type
          number
        }
        choices(allowRandomize: true) {
          id
          title
          description
          color
          image {
            id
            url
          }
        }
      }
    }
  `,
};

type ConditionalJumpCondition = {|
  +id: ?string,
  +operator: LogicJumpConditionOperator,
  +question: {|
    +id: string,
    +title: string,
  |},
  +value?: ?{|
    +id: string,
    +title: string,
  |},
|};

type Jump = {|
  +id: ?string,
  +origin: {|
    +id: string,
  |},
  +destination: {|
    +id: string,
    +title: string,
    +number: number,
  |},
  +conditions: ?$ReadOnlyArray<?ConditionalJumpCondition>,
|};

export type QuestionChoice = {|
  +id: string,
  +title: string,
  +description: ?string,
  +color: ?QuestionChoiceColor,
  +image: ?{|
    +id: string,
    +url: string,
  |},
|};

// This is a cp/paster of
// responsesHelper_question without $refType
export type Question = {|
  +__typename: string,
  +id: string,
  +title: string,
  +number: number,
  +private: boolean,
  +position: number,
  +required: boolean,
  +helpText: ?string,
  +alwaysJumpDestinationQuestion: ?{|
    +id: string,
    +title: string,
    +number: number,
  |},
  +jumps: ?$ReadOnlyArray<?Jump>,
  +description: ?string,
  +type: QuestionTypeValue,
  +isOtherAllowed?: boolean,
  +randomQuestionChoices?: boolean,
  +validationRule?: ?{|
    +type: MultipleChoiceQuestionValidationRulesTypes,
    +number: number,
  |},
  +choices?: ?$ReadOnlyArray<QuestionChoice>,
|};
export type Questions = $ReadOnlyArray<Question>;

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

type ResponseInReduxForm = {|
  question: string,
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
|};

export type ResponsesInReduxForm = $ReadOnlyArray<ResponseInReduxForm>;

// The real type is
//
// type SubmitResponses = $ReadOnlyArray<{|
//   value: string,
//   question: string,
// |} | {|
//   question: string,
//   medias: $ReadOnlyArray<string>,
// |}>;
type SubmitResponses = $ReadOnlyArray<{|
  value?: any,
  question: string,
  medias?: ?$ReadOnlyArray<string>,
|}>;

const IS_OPERATOR = 'IS';
const IS_NOT_OPERATOR = 'IS_NOT';

const getValueFromSubmitResponse = (response: ?ResponseInReduxForm): ?string => {
  if (response && typeof response.value === 'string') {
    return response.value;
  }
  if (
    response &&
    response.value &&
    typeof response.value === 'object' &&
    !Array.isArray(response.value)
  ) {
    return response.value.labels[0];
  }
  if (response && response.value && Array.isArray(response.value)) {
    return response.value[0].name;
  }
  return null;
};

export const getValueFromResponse = (questionType: string, responseValue: string) => {
  // For some questions type we need to parse the JSON of previous value
  try {
    if (questionType === 'button') {
      return JSON.parse(responseValue).labels[0];
    }
    if (questionType === 'radio' || questionType === 'checkbox' || questionType === 'number') {
      return JSON.parse(responseValue);
    }
    if (questionType === 'ranking') {
      return JSON.parse(responseValue).labels;
    }
  } catch (e) {
    invariant(false, `Failed to parse: ${responseValue}`);
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
          question: questionId,
          value: getValueFromResponse(question.type, response.value),
        };
      }
      if (typeof response.medias !== 'undefined') {
        return { question: questionId, value: response.medias };
      }
    }
    // Otherwise we create an empty response
    if (question.type === 'medias') {
      return { question: questionId, value: [] };
    }
    if (question.type === 'radio' || question.type === 'checkbox') {
      return { question: questionId, value: { labels: [], other: null } };
    }
    return { question: questionId, value: null };
  });

const formattedChoicesInField = field =>
  field.choices &&
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
  value: string | { labels: string, other: string },
};

type ResponsesError = ResponseError[];

const hasAnsweredQuestion = (question: Question, responses: ResponsesInReduxForm): boolean => {
  const answer = responses.filter(Boolean).find(response => response.question === question.id);
  if (answer) {
    const submitResponse = getValueFromSubmitResponse(answer);
    return !!('value' in answer && (submitResponse !== null && submitResponse !== ''));
  }
  return false;
};

// alwaysJumpDestinationQuestion can be nullable, but when we call this method it is not
// null, we make verification about question.alwaysJumpDestinationQuestion, but flow does not recognize it
// Typically in this situation I would unwrap the value of question.alwaysJumpDestinationQuestion!, but
// unwrapping value does not seems to exists in flow
const createJumpFromAlwaysQuestion = (question: Question): Jump => ({
  // $FlowFixMe
  destination: question.alwaysJumpDestinationQuestion,
  conditions: [],
  origin: {
    id: question.id,
  },
  id: undefined,
});

export const validateResponses = (
  questions: Questions,
  responses: ResponsesInReduxForm,
  // TODO: remove this parameter from the function and create generic traduction keys for all errors.
  className: string,
  intl: IntlShape,
): { responses?: ResponsesError } => {
  const responsesError = questions.map(question => {
    const response = responses.filter(res => res && res.question === question.id)[0];
    if (question.required) {
      if (question.type === 'medias') {
        if (!response || (Array.isArray(response.value) && response.value.length === 0)) {
          return { value: `${className}.constraints.field_mandatory` };
        }
      } else if (!question.validationRule && question.type === 'checkbox') {
        if (
          !response ||
          (response.value &&
            Array.isArray(response.value.labels) &&
            response.value.labels.length === 0 &&
            response.value.other === null)
        ) {
          return { value: `${className}.constraints.field_mandatory` };
        }
      } else if (question.type === 'radio') {
        if (
          !response ||
          (response.value &&
            Array.isArray(response.value.labels) &&
            response.value.labels.length === 0 &&
            (response.value.other === null || response.value.other === ''))
        ) {
          // We don't have a field with ${name}.value
          // Maybe ${name}.value._error could do the job but it doesn't
          // For now, we have to set the error to ${name}.value.other and/or ${name}.value.labels
          return {
            value: {
              other: `${className}.constraints.field_mandatory`,
              labels: `${className}.constraints.field_mandatory`,
            },
          };
        }
      } else if (!response || !response.value) {
        return { value: `${className}.constraints.field_mandatory` };
      }
    }

    if (
      question.type === 'number' &&
      response.value &&
      typeof response.value === 'string' &&
      !checkOnlyNumbers(response.value)
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
          value: intl.formatMessage({ id: 'reply.constraints.choices_equal' }, { nb: rule.number }),
        };
      }
    }
  });

  return responsesError && responsesError.length ? { responses: responsesError } : {};
};

export const getNextLogicJumpQuestion = (question: Question, questions: Questions): ?Question => {
  return (
    questions.slice(questions.indexOf(question) + 1).find(q => q.jumps && q.jumps.length > 0) ||
    null
  );
};

// This method is used to get a list of dependent questions (a question is dependant when
// it is present in the same branch tree of another question) based on a user answer.
export const getQuestionDepsIds = (
  question: Question,
  questions: Questions,
  answer: string,
): string[] => {
  const jumpQuestion = getNextLogicJumpQuestion(question, questions);
  if (jumpQuestion) {
    return jumpQuestion.jumps
      ? Array.from(
          new Set(
            jumpQuestion.jumps.filter(Boolean).reduce((acc, jump) => {
              const destination = questions.find(q => q.id === jump.destination.id);
              return [
                ...acc,
                ...(jumpQuestion.alwaysJumpDestinationQuestion
                  ? [
                      jumpQuestion.alwaysJumpDestinationQuestion.id,
                      jumpQuestion.id,
                      ...(destination ? getQuestionDepsIds(destination, questions, answer) : []),
                    ]
                  : []),
                ...(jump.conditions &&
                jump.conditions
                  .filter(Boolean)
                  .filter(
                    condition =>
                      condition.value &&
                      condition.question &&
                      condition.question.id === question.id &&
                      condition.value.title === answer,
                  ).length > 0
                  ? [
                      jump.destination.id,
                      ...(destination ? getQuestionDepsIds(destination, questions, answer) : []),
                    ]
                  : []),
              ];
            }, []),
          ),
        )
      : [];
  }
  return [];
};

const questionsHaveLogicJump = questions =>
  questions.reduce(
    (acc, question) => acc || (question && question.jumps && question.jumps.length > 0),
    false,
  );

const getConditionReturn = (
  response: ?ResponseInReduxForm,
  condition: ConditionalJumpCondition,
): boolean => {
  const userResponse = getValueFromSubmitResponse(response);
  if (response && userResponse && condition.value) {
    switch (condition.operator) {
      case IS_OPERATOR:
        return condition.value.title === userResponse;
      case IS_NOT_OPERATOR:
        return condition.value.title !== userResponse;
      default:
        return false;
    }
  }
  return false;
};

export const isAnyQuestionJumpsFullfilled = (
  question: Question,
  responses: ResponsesInReduxForm,
): boolean => {
  if (question.jumps) {
    return (
      question.jumps.filter(Boolean).some(jump =>
        jump.conditions
          ? jump.conditions.filter(Boolean).every(condition => {
              const answered = responses
                .filter(Boolean)
                .find(response => response.question === condition.question.id);
              return getConditionReturn(answered, condition);
            })
          : false,
      ) || !!(question.alwaysJumpDestinationQuestion && hasAnsweredQuestion(question, responses))
    );
  }
  return !!(question.alwaysJumpDestinationQuestion && hasAnsweredQuestion(question, responses));
};

// This method returns, for a given questions and based on user's answers, the list of fullfilled logic jumps
// (all the jumps where all the conditions have been met)
export const getFullfilledJumps = (question: Question, responses: ResponsesInReduxForm): Jump[] => {
  const elseJumps =
    question.alwaysJumpDestinationQuestion && hasAnsweredQuestion(question, responses)
      ? [createJumpFromAlwaysQuestion(question)]
      : [];
  if (question.jumps) {
    const fullfilleds = question.jumps.filter(Boolean).filter(jump =>
      jump.conditions
        ? jump.conditions.filter(Boolean).every(condition => {
            const answered = responses.find(
              response => response.question === condition.question.id,
            );
            return getConditionReturn(answered, condition);
          })
        : false,
    );
    // Here, one ore more conditions have been fullfilled, so we return them to show questions based on their conditions
    if (fullfilleds.length > 0) {
      return fullfilleds;
    }
    const answered = responses.find(response => response.question === question.id);
    if (answered && getValueFromSubmitResponse(answered)) {
      // Here, no conditions have been met and the user have correctly answered the question so we are in the "else" case
      return elseJumps;
    }
    // Here, no conditions have been met and the user have not answered the question so we show nothing more
    return [];
  }
  return [];
};

// This is the main method, used in `renderResponses` that returns, given the Questionnaire's questions and the
// user's answers, a list of questions ids that should be displayed to the user based on it's answers
// and the logic jumps defined for the questions
export const getAvailableQuestionsIds = (
  questions: Questions,
  responses: ResponsesInReduxForm,
): string[] => {
  // If no jump in questionnaire every question is available
  const hasLogicJumps = questionsHaveLogicJump(questions);
  if (!hasLogicJumps) {
    return questions.map(q => q.id);
  }
  //
  // Otherwise let's calculate what is currently displayed to user…
  const firstLogicQuestion = questions.find(
    question =>
      (question.jumps && question.jumps.length > 0) || question.alwaysJumpDestinationQuestion,
  );

  // We need the first questions before the first logic jump of the questionnaire, so we display
  // them to the user
  const firstQuestionsIds = questions
    .slice(0, questions.indexOf(firstLogicQuestion) + 1)
    .map(question => question.id);

  // We get all the fullfilled questions ids (the questions that have met all the conditions)
  const fullfilledQuestionsIds = questions.reduce((acc, question) => {
    if (isAnyQuestionJumpsFullfilled(question, responses)) {
      const jumps = getFullfilledJumps(question, responses);
      const answers = jumps.map(
        jump => responses.find(response => response.question === jump.origin.id) || null,
      );
      const answer = answers.filter(Boolean).find(a => a.question === question.id) || null;
      if (
        jumps.length > 0 &&
        (responses.length === 0 || (answer && getValueFromSubmitResponse(answer) === null))
      ) {
        const visibleJumps = jumps.filter(Boolean).map(jump => jump.destination.id);

        return [...acc, ...visibleJumps];
      }
      return [...acc, ...jumps.filter(Boolean).map(jump => jump.destination.id)];
    }
    return acc;
  }, []);

  fullfilledQuestionsIds.map(qId => questions.find(q => q.id === qId));

  // $FlowFixMe
  return Array.from(new Set([...firstQuestionsIds, ...fullfilledQuestionsIds]));
};

export const formatSubmitResponses = (
  responses: ?ResponsesInReduxForm,
  questions: Questions,
): SubmitResponses => {
  if (!responses) return [];
  const answeredQuestionsIds = getAvailableQuestionsIds(questions, responses);
  return responses.map(res => {
    const question = questions.filter(q => res.question === q.id)[0];
    const { type: questionType } = question;

    if (questionType === 'medias') {
      const medias = answeredQuestionsIds.includes(question.id)
        ? Array.isArray(res.value)
          ? res.value.map(value => value.id)
          : []
        : null;
      return {
        question: res.question,
        medias,
      };
    }
    let { value } = res;
    if (questionType === 'ranking' || questionType === 'button') {
      value = answeredQuestionsIds.includes(question.id)
        ? JSON.stringify({
            labels: Array.isArray(res.value) ? res.value : [res.value],
            other: null,
          })
        : null;
    } else if (questionType === 'checkbox' || questionType === 'radio') {
      value = answeredQuestionsIds.includes(question.id) ? JSON.stringify(res.value) : null;
    } else if (questionType === 'number') {
      return {
        question: res.question,
        value: res.value,
      };
    }
    if (typeof value === 'string') {
      value = answeredQuestionsIds.includes(question.id) ? value : null;
      return { value, question: res.question };
    }
    return { value: null, question: res.question };
  });
};

export const renderResponses = ({
  fields,
  questions,
  responses,
  intl,
  form,
  change,
  disabled,
}: {|
  ...FieldArrayProps,
  questions: Questions,
  responses: ResponsesInReduxForm,
  change: (field: string, value: any) => void,
  form: string,
  intl: IntlShape,
  disabled: boolean,
|}) => {
  const strategy = getRequiredFieldIndicationStrategy(questions);
  const availableQuestions = getAvailableQuestionsIds(questions, responses);
  const ids = questions
    .filter(Boolean)
    .filter(question => !availableQuestions.includes(question.id))
    .map(question => question.id);
  ids.forEach(id => {
    const question = questions.find(q => q.id === id);
    if (question) {
      const indexInRedux = questions.indexOf(question);
      change(`responses[${indexInRedux}].value`, null);
    }
  });
  return (
    <div>
      {fields.map((member, index) => {
        const field = questions[index];
        let isAvailableQuestion = true;

        if (!availableQuestions.includes(field.id)) {
          isAvailableQuestion = false;
        }

        const { isOtherAllowed } = field;

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

        const label = (
          <React.Fragment>
            {field.number && <span className="visible-print-block">{field.number}.</span>}{' '}
            <span dangerouslySetInnerHTML={{ __html: labelMessage }} />
          </React.Fragment>
        );

        switch (field.type) {
          case 'section': {
            return (
              <div key={field.id} className="form__section">
                <TitleInvertContrast>{field.title}</TitleInvertContrast>
                <div className="mb-15">
                  <WYSIWYGRender value={field.description} />
                </div>
              </div>
            );
          }
          case 'medias': {
            return (
              <div
                key={field.id}
                className={isAvailableQuestion === false ? 'visible-print-block' : ''}>
                <PrivateBox show={field.private}>
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
                  {/* $FlowFixMe please fix this */}
                  <ConditionalJumps jumps={field.jumps} />
                </PrivateBox>
              </div>
            );
          }
          case 'select': {
            if (!('choices' in field)) return null;
            return (
              <div
                key={field.id}
                className={isAvailableQuestion === false ? 'visible-print-block' : ''}>
                <PrivateBox show={field.private}>
                  <Field
                    name={`${member}.value`}
                    id={`${form}-${member}`}
                    type={field.type}
                    component={component}
                    help={field.helpText}
                    isOtherAllowed={isOtherAllowed}
                    description={field.description}
                    placeholder="reply.your_response"
                    label={label}
                    disabled={disabled}>
                    <option value="" disabled>
                      {intl.formatMessage({ id: 'global.select' })}
                    </option>
                    {field.choices &&
                      field.choices.map(choice => (
                        <option key={choice.id} value={choice.title}>
                          {choice.title}
                        </option>
                      ))}
                  </Field>
                  <div className="visible-print-block form-fields">
                    {field.choices &&
                      field.choices.map(choice => (
                        <div key={choice.id} className="radio">
                          {choice.title}
                        </div>
                      ))}
                  </div>
                  {/* $FlowFixMe please fix this */}
                  <ConditionalJumps jumps={field.jumps} />
                </PrivateBox>
              </div>
            );
          }
          default: {
            const response =
              responses && responses[index] && responses[index].value
                ? responses[index].value
                : null;
            let choices = [];
            if (
              field.type === 'ranking' ||
              field.type === 'radio' ||
              field.type === 'checkbox' ||
              field.type === 'button'
            ) {
              choices = formattedChoicesInField(field);

              if (field.type === 'radio') {
                return (
                  <div
                    key={field.id}
                    className={isAvailableQuestion === false ? 'visible-print-block' : ''}>
                    <PrivateBox show={field.private}>
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
                      {/* $FlowFixMe please fix this */}
                      <ConditionalJumps jumps={field.jumps} />
                    </PrivateBox>
                  </div>
                );
              }
            }

            return (
              <div
                key={field.id}
                className={isAvailableQuestion === false ? 'visible-print-block' : ''}>
                <PrivateBox show={field.private}>
                  <Field
                    name={`${member}.value`}
                    id={`${form}-${member}`}
                    type={field.type}
                    component={component}
                    description={field.description}
                    help={field.helpText}
                    isOtherAllowed={isOtherAllowed}
                    placeholder="reply.your_response"
                    choices={choices}
                    label={label}
                    disabled={disabled}
                    value={response}
                  />
                </PrivateBox>
              </div>
            );
          }
        }
      })}
    </div>
  );
};
