// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Field, FieldArray, formValueSelector } from 'redux-form';
import { FormattedMessage } from 'react-intl';
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, Button } from 'react-bootstrap';
import QuestionJumpConditionsAdminForm from './QuestionJumpConditionsAdminForm';
import type { GlobalState } from '../../types';
import component from '../Form/Field';
import type { responsesHelper_adminQuestion } from '~relay/responsesHelper_adminQuestion.graphql';
import type { QuestionnaireAdminConfigurationForm_questionnaire } from '~relay/QuestionnaireAdminConfigurationForm_questionnaire.graphql';
import { multipleChoiceQuestions } from '../ProposalForm/ProposalFormAdminQuestionModal';

type ParentProps = {|
  formName: string,
  oldMember: string,
|};
type Props = {|
  ...ParentProps,
  fields: { length: number, map: Function, remove: Function, push: Function },
  jumps: $PropertyType<responsesHelper_adminQuestion, 'jumps'>,
  questions: $PropertyType<QuestionnaireAdminConfigurationForm_questionnaire, 'questions'>,
  formName: string,
  currentQuestion: Object,
|};

export class QuestionsJumpAdminForm extends React.Component<Props> {
  render() {
    const { fields, questions, oldMember, formName, currentQuestion } = this.props;
    const firstMultipleChoiceQuestion = questions.find(question =>
      multipleChoiceQuestions.includes(question.type),
    );
    const isMultipleQuestion = multipleChoiceQuestions.includes(currentQuestion.type);
    return (
      <div className="form-group" id="questions_choice_panel_personal">
        <ListGroup>
          {fields.map((member, index) => (
            <div className="panel-custom panel panel-default">
              <div className="panel-heading">
                <i
                  className="cap cap-android-menu"
                  style={{ color: '#0388CC', fontSize: '20px' }}
                />
                <h3 className="panel-title">
                  <FormattedMessage id="answering-this-question" />
                </h3>
                <button
                  type="button"
                  style={{ border: 'none', fontSize: '20px', backgroundColor: '#f5f5f5' }}
                  onClick={() => fields.remove(index)}>
                  X
                </button>
              </div>
              <div className="panel-body">
                <FieldArray
                  name={`${member}.conditions`}
                  component={QuestionJumpConditionsAdminForm}
                  formName={formName}
                  member={member}
                />
              </div>
            </div>
          ))}
        </ListGroup>
        <Button
          bsStyle="primary"
          className="btn--outline box-content__toolbar"
          onClick={() => {
            fields.push({
              origin: {
                id: currentQuestion.id,
              },
              conditions: [
                {
                  question: {
                    id: isMultipleQuestion
                      ? currentQuestion.id
                      : firstMultipleChoiceQuestion
                      ? firstMultipleChoiceQuestion.id
                      : null,
                  },
                  value: isMultipleQuestion
                    ? currentQuestion.choices[0]
                    : firstMultipleChoiceQuestion
                    ? firstMultipleChoiceQuestion.choices && firstMultipleChoiceQuestion.choices[0]
                    : null,
                  operator: 'IS',
                },
              ],
              destination: {
                id: currentQuestion.id,
              },
            });
          }}>
          <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
        </Button>
        <div className="movable-element">
          <div className="mb-10">
            <h4 className="panel-title">
              <FormattedMessage
                id={fields && fields.length === 0 ? 'always-go-to' : 'jump-other-goto'}
              />
            </h4>
            <Field
              id={`${oldMember}.alwaysJumpDestinationQuestion.id`}
              name={`${oldMember}.alwaysJumpDestinationQuestion.id`}
              type="select"
              normalize={val => (val !== '' ? val : null)}
              component={component}>
              <option value="" />
              {questions
                .filter(question => {
                  // We should not display the always jump of a question when it is referecing itself
                  // because an always jump could not redirect to itself
                  return question.id && currentQuestion && question.id !== currentQuestion.id
                })
                .map((question, i) => (
                <option value={question.id}>{`${i + 1}. ${question.title}`}</option>
              ))}
            </Field>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: ParentProps) => {
  const selector = formValueSelector(props.formName);
  return {
    currentQuestion: selector(state, `${props.oldMember}`),
    questions: selector(state, 'questions'),
  };
};

export default connect(mapStateToProps)(QuestionsJumpAdminForm);
