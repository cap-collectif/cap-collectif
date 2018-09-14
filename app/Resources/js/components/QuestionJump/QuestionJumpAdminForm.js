// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { formValueSelector, arrayPush, Field } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import type { GlobalState, Dispatch } from '../../types';
import component from "../Form/Field";
import {changeOrderBy, fetchProjects} from "../../redux/modules/project";

type Jumps = $ReadOnlyArray<{|
  +id: string,
  +always: boolean,
  +origin: ?Object,
  +destination: ?Object,
  +conditions: ?Object,
|}>;

type Props = {
  dispatch: Dispatch,
  fields: { length: number, map: Function, remove: Function },
  jumps: Jumps,
  questions: Object,
  formName: string,
  oldMember: string,
  intl: IntlShape,
};

type State = { selectedQuestion: number };


export class QuestionJumpAdminForm extends React.Component<Props, State> {
  state = {
    editIndex: null,
    selectedQuestion: 0
  };

  handleQuestionChange = (e) => {
    this.setState({ selectedQuestion: e.target.value });
  };

  render() {
    const { dispatch, fields, jumps, oldMember, questions } = this.props;
    const { selectedQuestion } = this.state;
    const arrayQuestions = [];
    questions.map((question) => {
      arrayQuestions[question.id] = question.questionChoices;
    });

    return (
      <div className="form-group" id="questions_choice_panel_personal">
        <ListGroup>
          {fields.map((member, index) => (
            <ListGroupItem key={index}>
              <Field
                id={`${member}.origin`}
                name={`${member}.origin`}
                type="select"
                onChange={e => {
                  this.handleQuestionChange(e);
                }}
                component={component}>
                {questions.map((question, questionIndex) => {
                  return <option value={question.id}>
                    {questionIndex}. {question.title}
                  </option>
                })}
              </Field>
              <Field
                id={`${member}.conditions.operator`}
                name={`${member}.conditions.operator`}
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
                id={`${member}.destination`}
                name={`${member}.destination`}
                type="select"
                component={component}>
                {selectedQuestion === 0 ? '' : arrayQuestions[selectedQuestion].map((questionChoice, questionChoiceIndex) => (
                  <option value={questionChoice.id}>
                    {questionChoiceIndex}. {questionChoice.title}
                  </option>
                ))}
              </Field>
              <strong>{jumps[index].conditions[0].value.title}</strong>
              <p>Then go to</p>
              <strong>{jumps[index].destination.title}</strong>
            </ListGroupItem>
          ))}
        </ListGroup>
        <Button
          bsStyle="primary"
          className="btn--outline box-content__toolbar"
          onClick={() => {
            dispatch(arrayPush(this.props.formName, `${oldMember}.jumps`, {}));
            this.setState({ editIndex: fields.length });
          }}>
          <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
        </Button>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  return {
    jumps: selector(state, `${props.oldMember}.jumps`),
    questions: selector(state, 'questions'),
  };
};

export default connect(mapStateToProps)(injectIntl(QuestionJumpAdminForm));
