// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { formValueSelector, Field, arrayRemove } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import type { GlobalState, Dispatch } from '../../types';
import component from '../Form/Field';

type ReduxProps = { selectedQuestion: number };
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

type State = {
  currentQuestion: ?number,
};

export class QuestionJumpConditionAdminForm extends React.Component<Props, State> {
  state = {
    currentQuestion: null,
  };

  handleQuestionChange = (e: $FlowFixMe) => {
    this.setState({ currentQuestion: e.target.value });
  };

  displayValueList = (
    currentQuestion: ?number,
    selectedQuestion: ?number,
    arrayQuestions: Array<Object>,
  ) => {
    let choiceList = [];
    if (currentQuestion) {
      choiceList = arrayQuestions[currentQuestion];
    } else if (selectedQuestion) {
      choiceList = arrayQuestions[selectedQuestion];
    }

    return choiceList
      ? choiceList.map((questionChoice, questionChoiceIndex) => (
          <option value={questionChoice.id}>
            {questionChoiceIndex}. {questionChoice.title}
          </option>
        ))
      : null;
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
    const { currentQuestion } = this.state;
    const arrayQuestions = [];
    questions.map(question => {
      if (
        question.kind !== 'simple' &&
        question.id &&
        question.questionChoices &&
        question.questionChoices.length > 0
      ) {
        arrayQuestions[question.id] = question.questionChoices;
      }
    });
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
          normalize={val => val && parseInt(val, 10)}
          type="select"
          onChange={e => {
            this.handleQuestionChange(e);
          }}
          component={component}>
          {questions.map((question, questionIndex) => {
            if (
              question.kind !== 'simple' &&
              question.id &&
              question.questionChoices &&
              question.questionChoices.length > 0
            ) {
              return (
                <option value={question.id}>
                  {questionIndex}. {question.title}
                </option>
              );
            }
          })}
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
          {this.displayValueList(currentQuestion, selectedQuestion, arrayQuestions)}
        </Field>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    selectedQuestion: selector(state, `${props.member}.question.id`),
  };
};

const container = connect(mapStateToProps)(QuestionJumpConditionAdminForm);

export default injectIntl(container);
