// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { formValueSelector, Field, FieldArray, change } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import type { GlobalState } from '~/types';
import component from '../Form/Field';
import QuestionJumpConditionAdminForm from './QuestionJumpConditionAdminForm';
import type { Jump } from '../Questionnaire/QuestionnaireAdminConfigurationForm';
import type { Questions } from '~/components/Form/Form.type';

type Props = {
  ...ReduxFormFormProps,
  fields: { length: number, map: Function, remove: Function, push: Function },
  questions: Questions,
  formName: string,
  member: string,
  currentJump: Jump,
};

export const QuestionJumpConditionsAdminForm = ({
  fields,
  questions,
  member,
  formName,
  currentJump,
  dispatch,
}: Props) => {
  const currentQuestion = questions.find(question => question.id === currentJump?.origin.id);
  const isMultipleChoiceQuestion =
    currentQuestion && currentQuestion.__typename === 'MultipleChoiceQuestion';
  const firstMultipleChoiceQuestion = questions.find(
    question => question.__typename === 'MultipleChoiceQuestion',
  );

  const getDefaultCondition = () => {
    let value = null;

    if (currentQuestion && isMultipleChoiceQuestion) {
      value = currentQuestion.choices && currentQuestion.choices[0];
    } else if (firstMultipleChoiceQuestion) {
      value = firstMultipleChoiceQuestion.choices && firstMultipleChoiceQuestion.choices[0];
    }

    return {
      question: {
        id: currentJump?.origin.id,
      },
      value,
      operator: 'IS',
    };
  };

  const defaultCondition = getDefaultCondition();

  const onChange = e => {
    const currentJumpDestinationId = currentJump.destination.id;
    const currentJumpDestination = questions.find(q => q.id === currentJumpDestinationId);
    const currentJumpDestinationIndex = questions.findIndex(q => q.id === currentJumpDestinationId);
    const updatedDestinationJumps = currentJumpDestination?.destinationJumps?.filter(
      jump => jump.origin.id !== currentQuestion?.id,
    );

    dispatch(
      change(
        formName,
        `questions[${currentJumpDestinationIndex}].destinationJumps`,
        updatedDestinationJumps,
      ),
    );

    const destinationQuestionId = e.target.value;
    const destinationQuestion = questions.find(q => q.id === destinationQuestionId);
    const destinationQuestionIndex = questions.findIndex(q => q.id === destinationQuestionId);
    dispatch(
      change(formName, `questions[${destinationQuestionIndex}].destinationJumps`, [
        ...(destinationQuestion?.destinationJumps ?? []),
        {
          origin: {
            id: currentQuestion?.id,
            title: currentQuestion?.title,
          },
        },
      ]),
    );
  };

  return (
    <div className="form-group" id="questions_choice_panel_personal">
      {fields.map((memberConditions, index) => (
        <div key={member}>
          <FieldArray
            component={QuestionJumpConditionAdminForm}
            questions={questions}
            member={memberConditions}
            formName={formName}
            name={formName}
            index={index}
            oldMember={member}
          />
          {fields.length > 1 && index + 1 < fields.length && (
            <p>
              <FormattedMessage id="and-or-conditions" tagName="b" />
            </p>
          )}
        </div>
      ))}
      <div>
        <Button
          bsStyle="primary"
          className="btn--outline box-content__toolbar"
          onClick={() => {
            fields.push(defaultCondition);
          }}>
          <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
        </Button>
        {fields.length > 0 && (
          <div>
            <p className="mt-5">
              <FormattedMessage id="then-go-to" tagName="b" />
            </p>
            <Field
              id={`${member}.destination.id`}
              name={`${member}.destination.id`}
              onChange={onChange}
              type="select"
              component={component}>
              {questions
                .filter(question => {
                  // We should not display the origin question of the jump when adding a new jump because a logic jump
                  // could not redirect to itself
                  return (
                    question.id &&
                    currentJump &&
                    currentJump.origin.id &&
                    question.id !== currentJump.origin.id
                  );
                })
                .map((question, index) => (
                  <option value={question.id} key={question.id}>
                    {index + 1}. {question.title}
                  </option>
                ))}
            </Field>
          </div>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    questions: selector(state, 'questions'),
    currentJump: selector(state, `${props.member}`),
  };
};

export default connect<any, any, _, _, _, _>(mapStateToProps)(QuestionJumpConditionsAdminForm);
