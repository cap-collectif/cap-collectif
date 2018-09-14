// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { formValueSelector, arrayPush, Field } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import type { GlobalState, Dispatch } from '../../types';
import component from "../Form/Field";
import {changeOrderBy, fetchProjects} from "../../redux/modules/project";

type Props = {
  questions: Object,
  selectedQuestion: any,
  formName: string,
  index: number
};

export class QuestionJumpAdminForm extends React.Component<Props, State> {

  render() {
    const { formName, index, questions } = this.props;

    return (
      <ListGroupItem key={index}>
        <Field
          id={`${formName}.origin`}
          name={`${formName}.origin`}
          type="select"
          component={component}>
          {questions.map((question, questionIndex) => {
            return <option value={question.id}>
              {questionIndex}. {question.title}
            </option>
          })}
        </Field>
        <Field
          id={`${formName}.conditions.operator`}
          name={`${formName}.conditions.operator`}
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
          id={`${formName}.destination`}
          name={`${formName}.destination`}
          type="select"
          component={component}>
        </Field>
      </ListGroupItem>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: Props) => {
  const selector = formValueSelector(props.formName);
  console.log('QUESTION*****');
  console.log(selector(state, `${props.formName}.origin`));
  return {
    selectedQuestion: selector(state, `${props.formName}.origin`)
  };
};

export default connect(mapStateToProps)(injectIntl(QuestionJumpAdminForm));
