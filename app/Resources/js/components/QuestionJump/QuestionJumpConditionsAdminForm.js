// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { formValueSelector, Field, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import type { GlobalState } from '../../types';
import component from '../Form/Field';
import QuestionJumpConditionAdminForm from './QuestionJumpConditionAdminForm';
import type { Jump } from '../Questionnaire/QuestionnaireAdminConfigurationForm';
import type { Questions } from '../../utils/responsesHelper';

type Props = {
  fields: { length: number, map: Function, remove: Function, push: Function },
  questions: Questions,
  formName: string,
  member: string,
  currentJump: Jump
};

export class QuestionJumpConditionsAdminForm extends React.Component<Props> {
  render() {
    const { fields, questions, member, formName, currentJump } = this.props;
    const currentQuestion = questions.find(question => question.id === currentJump.origin.id);
    const isMultipleChoiceQuestion = currentQuestion && currentQuestion.__typename === "MultipleChoiceQuestion";
    const firstMultipleChoiceQuestion = questions.find(question => question.__typename === "MultipleChoiceQuestion")
    const defaultCondition = {
      question: {
        id: currentJump.origin.id,
      },
      value: currentQuestion && isMultipleChoiceQuestion ?
        currentQuestion.choices && currentQuestion.choices[0] : firstMultipleChoiceQuestion ?
          firstMultipleChoiceQuestion.choices && firstMultipleChoiceQuestion.choices[0] : null,
      operator: 'IS',
    };
    return (
      <div className="form-group" id="questions_choice_panel_personal">
        {fields.map((memberConditions, index) => (
          <div>
            <FieldArray
              component={QuestionJumpConditionAdminForm}
              questions={questions}
              member={memberConditions}
              formName={formName}
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
                type="select"
                component={component}>
                {questions.map((question, questionIndex) => {
                  if (question.id) {
                    return (
                      <option value={question.id}>
                        {questionIndex}. {question.title}
                      </option>
                    );
                  }
                })}
              </Field>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    questions: selector(state, 'questions'),
    currentJump: selector(state, `${props.member}`),
  };
};

export default connect(mapStateToProps)(QuestionJumpConditionsAdminForm);
