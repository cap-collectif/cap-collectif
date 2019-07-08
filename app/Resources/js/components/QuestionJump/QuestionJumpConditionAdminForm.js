// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { formValueSelector, Field, arrayRemove, change } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import type { GlobalState, Dispatch } from '../../types';
import component from '../Form/Field';
import type { QuestionsInReduxForm } from '../../utils/submitQuestion';
import type { QuestionChoice } from '../../utils/responsesHelper';

type ReduxProps = { selectedQuestion: string };
type Props = ReduxProps & {
  fields: { length: number, map: () => void, remove: () => void },
  questions: Object,
  formName: string,
  member: string,
  index: number,
  dispatch: Dispatch,
  oldMember: string,
  intl: IntlShape,
};

const OptionItem = ({
  questionChoice,
  index,
}: {
  questionChoice: QuestionChoice,
  index: number,
}) => (
  <option value={questionChoice.id}>
    {index + 1}. {questionChoice.title}
  </option>
);

export class QuestionJumpConditionAdminForm extends React.Component<Props> {
  handleQuestionChange = () => {
    const { questions, selectedQuestion, member, formName, dispatch } = this.props;
    const question = questions.find(q => q.id === selectedQuestion);

    if (question && question.choices) {
      dispatch(change(formName, `${member}.question.title`, question.title));
      dispatch(change(formName, `${member}.value.id`, question.choices[0].id));
      dispatch(change(formName, `${member}.value.title`, question.choices[0].title));
    }
  };

  displayValueList = (questions: QuestionsInReduxForm, selectedQuestion: string) => {
    const question = questions.find(q => q.id === selectedQuestion);
    if (question) {
      return question.choices && question.choices
        ? question.choices
            .filter(Boolean)
            .map<any>((choice, index) => <OptionItem questionChoice={choice} index={index} />)
        : null;
    }
    return null;
  };

  render() {
    const {
      intl,
      index,
      questions,
      selectedQuestion,
      member,
      dispatch,
      formName,
      oldMember,
    } = this.props;
    return (
      <div className="movable-element" key={index}>
        <div className="mb-10">
          <h4 className="panel-title">
            <i
              className="cap cap-android-menu mr-10"
              style={{ color: 'rgb(3, 136, 204)', fontSize: '15px' }}
            />
            <FormattedMessage id="if-the-question-answer-is" />
            <button
              type="button"
              style={{ border: 'none', float: 'right', backgroundColor: '#f5f5f5' }}
              title="Remove Member"
              onClick={() => dispatch(arrayRemove(formName, `${oldMember}.conditions`, index))}>
              X
            </button>
          </h4>
        </div>
        <Field
          id={`${member}.question.id`}
          name={`${member}.question.id`}
          type="select"
          onChange={this.handleQuestionChange}
          component={component}>
          {questions
            .filter(question => question.__typename === 'MultipleChoiceQuestion')
            .map((question, questionIndex) => (
              <option value={question.id}>
                {questionIndex + 1}. {question.title}
              </option>
            ))}
        </Field>
        <Field
          id={`${member}.operator`}
          name={`${member}.operator`}
          type="select"
          component={component}>
          <option value="IS">{intl.formatMessage({ id: 'is' })}</option>
          <option value="IS_NOT">{intl.formatMessage({ id: 'is-not' })}</option>
        </Field>
        <Field
          id={`${member}.value.id`}
          name={`${member}.value.id`}
          type="select"
          component={component}>
          {this.displayValueList(questions, selectedQuestion)}
        </Field>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => {
  const { questions } = props;
  const selector = formValueSelector(props.formName);
  const selectedQuestion = selector(state, `${props.member}.question.id`);
  const currentQuestion = questions.find(question => question.id === selectedQuestion);
  const isMultipleChoiceQuestion =
    currentQuestion && currentQuestion.__typename === 'MultipleChoiceQuestion';
  const firstMultipleChoiceQuestion = questions.find(
    question => question.__typename === 'MultipleChoiceQuestion',
  );
  return {
    selectedQuestion: isMultipleChoiceQuestion
      ? currentQuestion.id
      : firstMultipleChoiceQuestion
      ? firstMultipleChoiceQuestion.id
      : null,
  };
};

const container = connect(mapStateToProps)(QuestionJumpConditionAdminForm);

export default injectIntl(container);
