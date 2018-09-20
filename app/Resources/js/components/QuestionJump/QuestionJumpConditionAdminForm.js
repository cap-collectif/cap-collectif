// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { formValueSelector, Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import type { GlobalState } from '../../types';
import component from '../Form/Field';

type RelayProps = { selectedQuestion: any };
type Props = RelayProps & {
  fields: { length: number, map: Function, remove: Function },
  questions: Object,
  formName: string,
  member: string,
  index: number,
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

  render() {
    const { index, questions, selectedQuestion, member, fields } = this.props;
    const { currentQuestion } = this.state;
    const arrayQuestions = [];
    questions.map(question => {
      arrayQuestions[question.id] = question.questionChoices;
    });

    return (
      <div className="movable-element" key={index}>
        <button type="button" title="Remove Member" onClick={() => fields.remove(index)}>
          {' '}
          X{' '}
        </button>
        <Field
          id={`${member}.conditions[${index}].question.id`}
          name={`${member}.conditions[${index}].question.id`}
          normalize={val => val && parseInt(val, 10)}
          type="select"
          onChange={e => {
            this.handleQuestionChange(e);
          }}
          component={component}>
          {questions.map((question, questionIndex) => {
            return (
              <option value={question.id}>
                {questionIndex}. {question.title}
              </option>
            );
          })}
        </Field>
        <Field
          id={`${member}.conditions[${index}].operator`}
          name={`${member}.conditions[${index}].operator`}
          type="select"
          component={component}>
          <option value="IS">
            <FormattedMessage id="is" />
          </option>
          <option value="IS_NOT">
            <FormattedMessage id="is-not" />
          </option>
        </Field>
        <Field
          id={`${member}.conditions[${index}].value.id`}
          name={`${member}.value.id`}
          type="select"
          component={component}>
          {/* $FlowFixMe */}
          {currentQuestion !== null || selectedQuestion !== undefined
            ? arrayQuestions[currentQuestion !== null ? currentQuestion : selectedQuestion].map(
                (questionChoice, questionChoiceIndex) => (
                  <option value={questionChoice.id}>
                    {questionChoiceIndex}. {questionChoice.title}
                  </option>
                ),
              )
            : ''}
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

export default connect(mapStateToProps)(QuestionJumpConditionAdminForm);
