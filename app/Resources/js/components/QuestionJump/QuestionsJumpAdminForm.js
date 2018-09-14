// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { formValueSelector, arrayPush, Field } from 'redux-form';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ListGroup, ListGroupItem, ButtonToolbar, Button, Row, Col } from 'react-bootstrap';
import type { GlobalState, Dispatch } from '../../types';
import {QuestionJumpAdminForm} from "./QuestionJumpAdminForm";

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
  questions: Object,
  formName: string,
  oldMember: string,
};

type State = { selectedQuestion: number };


export class QuestionsJumpAdminForm extends React.Component<Props, State> {

  render() {
    const { dispatch, fields, oldMember, questions } = this.props;

    return (
      <div className="form-group" id="questions_choice_panel_personal">
        <ListGroup>
          {fields.map((member, index) => (
           <QuestionJumpAdminForm
             questions={questions}
             formName={member}
             index={index}
             />
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
  console.log('QUESTIONSSSS *****');

  console.log(selector(state, 'questions'));
  return {
    questions: selector(state, 'questions')
  };
};

export default connect(mapStateToProps)(injectIntl(QuestionsJumpAdminForm));
