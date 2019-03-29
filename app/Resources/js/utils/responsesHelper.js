// @flow
import * as React from 'react';
import { type IntlShape } from 'react-intl';
import { graphql } from 'react-relay';
import { type FieldArrayProps, Field } from 'redux-form';
import type { QuestionTypeValue } from '../components/Proposal/Page/__generated__/ProposalPageEvaluation_proposal.graphql';
import type { LogicJumpConditionOperator } from '../components/Reply/Form/__generated__/ReplyForm_questionnaire.graphql';
import { MultipleChoiceRadio } from '../components/Form/MultipleChoiceRadio';
import TitleInvertContrast from '../components/Ui/Typography/TitleInvertContrast';
import { checkOnlyNumbers } from '../services/Validator';
import component from '../components/Form/Field';
import PrivateBox from '../components/Ui/Boxes/PrivateBox';
import ConditionalJumps from './ConditionalJumps';
import WYSIWYGRender from '../components/Form/WYSIWYGRender';
import type {
  MultipleChoiceQuestionValidationRulesTypes,
  QuestionChoiceColor,
} from '~relay/responsesHelper_question.graphql';

// eslint-disable-next-line no-unused-vars
const ResponseFragment = graphql`
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
`;

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
const QuestionAdminFragment = graphql`
  fragment responsesHelper_adminQuestion on Question {
    id
    title
    number
    private
    position
    required
    helpText
    jumps {
      id
      always
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
`;

// eslint-disable-next-line no-unused-vars
const QuestionFragment = graphql`
  fragment responsesHelper_question on Question {
    id
    title
    number
    private
    position
    required
    helpText
    jumps {
      id
      always
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
`;

// This is a cp/paster of
// responsesHelper_question without $refType
type Question = {|
  +id: string,
  +title: string,
  +number: number,
  +private: boolean,
  +position: number,
  +required: boolean,
  +helpText: ?string,
  +jumps: ?$ReadOnlyArray<?{|
    +id: ?string,
    +always: boolean,
    +origin: {|
      +id: string,
    |},
    +destination: {|
      +id: string,
      +title: string,
      +number: number,
    |},
    +conditions: ?$ReadOnlyArray<?{|
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
    |}>,
  |}>,
  +description: ?string,
  +type: QuestionTypeValue,
  +isOtherAllowed?: boolean,
  +randomQuestionChoices?: boolean,
  +validationRule?: ?{|
    +type: MultipleChoiceQuestionValidationRulesTypes,
    +number: number,
  |},
  +choices?: ?$ReadOnlyArray<{|
    +id: string,
    +title: string,
    +description: ?string,
    +color: ?QuestionChoiceColor,
    +image: ?{|
      +id: string,
      +url: string,
    |},
  |}>,
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

export type ResponsesInReduxForm = $ReadOnlyArray<{|
  question: string,
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
type SubmitResponses = $ReadOnlyArray<{|
  value?: any,
  question: string,
  medias?: ?$ReadOnlyArray<string>,
|}>;

const getValueFromSubmitResponse = search => {
  if (search && typeof search.value === 'string') {
    return search.value;
  }
  if (search && search.value && typeof search.value === 'object' && !Array.isArray(search.value)) {
    return search.value.labels[0];
  }
  if (search && search.value && Array.isArray(search.value)) {
    return search.value[0].name;
  }
  return null;
};

const getConditionsResultForJump = (jump, responses) => {
  const conditions =
    jump &&
    jump.conditions &&
    jump.conditions.filter(Boolean).map(condition => {
      const search = responses
        .filter(Boolean)
        .find(r => condition && condition.question && r.question === condition.question.id);
      const userResponse = getValueFromSubmitResponse(search);
      return condition.operator === 'IS'
        ? condition && condition.value && condition.value.title === userResponse
        : condition && condition.value && condition.value.title !== userResponse;
    });

  return (jump && jump.always) || (conditions && conditions.every(condition => condition === true));
};

const populateQuestionsJump = (responses, questions, callback) => {
  const questionsWithJumpsIds = [];
  if (responses) {
    responses.forEach(response => {
      if (response.value) {
        const question = questions.find(q => q.id === response.question);
        if (question && question.jumps && question.jumps.length > 0) {
          question.jumps.some(jump => {
            const conditionsResult = getConditionsResultForJump(jump, responses);
            if (conditionsResult) {
              const questionWithJump = questions.find(
                q => q.id === (jump && jump.destination && jump.destination.id),
              );
              questionsWithJumpsIds.push(...callback(questionWithJump));
            }
            return conditionsResult;
          });
        }
      }
    });
  }
  return questionsWithJumpsIds;
};

const questionsHaveLogicJump = questions =>
  questions.reduce(
    (acc, question) => acc || (question && question.jumps && question.jumps.length > 0),
    false,
  );

const filterQuestions = (questions, questionsWithJumps, otherQuestions) => {
  const tree = {};
  questionsWithJumps.forEach(questionId => {
    tree[questionId] = questions.filter(
      q => q && q.jumps && q.jumps.some(j => j && j.destination && j.destination.id === questionId),
    );
  });

  let questionsJumps = questionsWithJumps;
  let questionsOther = otherQuestions;

  Object.keys(tree).forEach(questionId => {
    tree[questionId].forEach(question => {
      if (!questionsWithJumps.includes(question.id) && !otherQuestions.includes(question.id)) {
        questionsJumps = questionsWithJumps.filter(qId => qId !== questionId);
        questionsOther = otherQuestions.filter(qId => qId !== questionId);
        questionsJumps.push(
          ...question.jumps.filter(jump => jump.always).map(jump => jump.destination.id),
        );
        questionsOther.push(
          ...question.jumps.filter(jump => jump.always).map(jump => jump.destination.id),
        );
      }
    });
  });

  return [questionsJumps, questionsOther];
};

const getAvailableQuestionsIdsAfter = (afterQuestion, questions, responses) => {
  const firstLogicQuestion = questions
    .filter(Boolean)
    .find(
      question =>
        question.required ||
        (question.jumps &&
          question.jumps.length > 0 &&
          afterQuestion &&
          question.position >= afterQuestion.position),
    );

  let firstQuestionsIds = [];
  if (firstLogicQuestion) {
    const filteredIds = questions
      .filter(
        question =>
          question.required ||
          (question.jumps &&
            question.jumps.length === 0 &&
            afterQuestion &&
            question.position > afterQuestion.position &&
            question.position < firstLogicQuestion.position),
      )
      .map(question => question.id);
    if (firstLogicQuestion && firstLogicQuestion.jumps) {
      firstLogicQuestion.jumps.some(jump => {
        if (jump && jump.always && jump.destination) {
          filteredIds.push(jump.destination.id);
        }
        return jump && jump.always;
      });
    }
    firstQuestionsIds = [firstLogicQuestion.id, ...filteredIds];
  } else {
    firstQuestionsIds = questions
      .filter(question => afterQuestion && question.position > afterQuestion.position)
      .map(question => question.id);
  }

  let questionsWithJumpsIds = populateQuestionsJump(responses, questions, questionWithJump =>
    questionWithJump ? [questionWithJump.id] : [],
  );

  [questionsWithJumpsIds, firstQuestionsIds] = filterQuestions(
    questions,
    questionsWithJumpsIds,
    firstQuestionsIds,
  );

  return Array.from(new Set([...questionsWithJumpsIds, ...firstQuestionsIds]));
};

export const getAvailableQuestionsIds = (
  questions: Questions,
  responses: ?ResponsesInReduxForm,
) => {
  // If no jump in questionnaire every question is available
  const hasLogicJumps = questionsHaveLogicJump(questions);
  if (!hasLogicJumps) {
    // $FlowFixMe
    return questions.map(q => q.id);
  }

  // Otherwise let's calculate what is currently displayed to user…
  const firstLogicQuestion = questions.find(
    question => question.jumps && question.jumps.length > 0,
  );
  const firstLogicQuestionId = firstLogicQuestion ? firstLogicQuestion.id : null;

  const questionIsADestination = [];
  questions.map(question => {
    if (question.jumps !== null && question.jumps !== undefined) {
      question.jumps.map(jump => {
        questionIsADestination.push(jump ? jump.destination.id : {});
      });
    }
  });

  const filteredIds = questions
    .filter(
      question =>
        question.required ||
        (question.jumps &&
          question.jumps.length === 0 &&
          firstLogicQuestion &&
          !questionIsADestination.includes(question.id)),
    )
    .map(question => question.id);

  const firstQuestionsIds = [firstLogicQuestionId, ...filteredIds];
  const questionsWithJumpsIds = populateQuestionsJump(responses, questions, questionWithJump =>
    getAvailableQuestionsIdsAfter(questionWithJump, questions, responses),
  );

  // $FlowFixMe
  return Array.from(new Set([...questionsWithJumpsIds, ...firstQuestionsIds]));
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
  responses: ?ResponsesInReduxForm,
  change: (field: string, value: any) => void,
  form: string,
  intl: IntlShape,
  disabled: boolean,
|}) => {
  const strategy = getRequiredFieldIndicationStrategy(questions);
  const availableQuestions = getAvailableQuestionsIds(questions, responses);

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
