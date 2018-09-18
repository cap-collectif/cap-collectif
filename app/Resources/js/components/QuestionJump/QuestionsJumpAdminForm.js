// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { ListGroup, Button } from 'react-bootstrap';
import QuestionJumpConditionsAdminForm from './QuestionJumpConditionsAdminForm';

type Props = {
  fields: { length: number, map: Function, remove: Function, push: Function },
  formName: string,
  oldMember: string,
};

export class QuestionsJumpAdminForm extends React.Component<Props> {
  render() {
    const { fields, oldMember, formName } = this.props;
    return (
      <div className="form-group" id="questions_choice_panel_personal">
        <ListGroup>
          {fields.map((member, index) => (
            <div className="panel-custom panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">En répondant à l'élément {index + 1}</h3>
              </div>
              <div className="panel-body">
                <FieldArray
                  name={`${member}.conditions`}
                  component={QuestionJumpConditionsAdminForm}
                  formName={formName}
                  member={member}
                  oldMember={oldMember}
                  conditionsLentgh={fields.length}
                />
              </div>
            </div>
          ))}
        </ListGroup>
        <Button
          bsStyle="primary"
          className="btn--outline box-content__toolbar"
          onClick={() => {
            fields.push();
          }}>
          <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
        </Button>
      </div>
    );
  }
}

export default connect()(QuestionsJumpAdminForm);
